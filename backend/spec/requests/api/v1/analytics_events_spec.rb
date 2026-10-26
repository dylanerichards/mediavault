require 'rails_helper'

RSpec.describe "Analytics events API", type: :request do
  let(:customer) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:headers) { auth_headers_for(customer) }
  let(:admin_headers) { auth_headers_for(admin) }

  describe "POST /api/v1/analytics_events" do
    it "creates an event owned by the current user with the full context" do
      params = {
        analytics_event: {
          action: "add_to_cart",
          target_type: "Book",
          target_id: 42,
          target_label: "Dune",
          search_term: "sci-fi"
        }
      }

      expect {
        post "/api/v1/analytics_events", params: params, headers: headers, as: :json
      }.to change(AnalyticsEvent, :count).by(1)

      expect(response).to have_http_status(:created)
      event = JSON.parse(response.body).dig("data", "event")
      expect(event["action"]).to eq("add_to_cart")
      expect(event["target_type"]).to eq("Book")
      expect(event["target_id"]).to eq(42)
      expect(event["target_label"]).to eq("Dune")
      expect(event["search_term"]).to eq("sci-fi")
      expect(event["user"]["id"]).to eq(customer.id)
      expect(event["user"]["name"]).to eq(customer.name)
      expect(event["created_at"]).to be_present

      expect(AnalyticsEvent.last.user_id).to eq(customer.id)
    end

    it "returns 422 for an invalid action" do
      post "/api/v1/analytics_events",
           params: { analytics_event: { action: "foo" } },
           headers: headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"]).to be_present
    end

    it "requires authentication" do
      post "/api/v1/analytics_events",
           params: { analytics_event: { action: "view_item" } }, as: :json
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/analytics_events (admin only, platform-wide)" do
    it "returns every user's events with a zero-filled summary" do
      mine = create(:analytics_event, user: admin, action: "view_item")
      theirs = create(:analytics_event, user: customer, action: "search", search_term: "dune")

      get "/api/v1/analytics_events", headers: admin_headers

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body)["data"]

      ids = data["events"].map { |e| e["id"] }
      expect(ids).to include(mine.id, theirs.id)
      expect(data["events"].map { |e| e["action"] }).to contain_exactly("view_item", "search")

      summary = data["summary"]
      expect(summary.map { |s| s["action"] }).to eq(AnalyticsEvent::ACTIONS)
      counts = summary.each_with_object({}) { |s, h| h[s["action"]] = s["count"] }
      expect(counts).to eq(
        "view_item" => 1,
        "search" => 1,
        "add_to_cart" => 0,
        "remove_from_cart" => 0,
        "add_to_favorite" => 0,
        "remove_from_favorite" => 0
      )

      expect(data["pagination"]).to be_present
    end

    it "includes behavior stats: top items, popular searches, active users" do
      create(:analytics_event, user: admin, action: "view_item", target_label: "Dune")
      create(:analytics_event, user: customer, action: "view_item", target_label: "Dune")
      create(:analytics_event, user: customer, action: "search", search_term: "sci-fi", target_label: nil)

      get "/api/v1/analytics_events", headers: admin_headers

      stats = JSON.parse(response.body).dig("data", "stats")
      expect(stats["total"]).to eq(3)
      expect(stats["top_items"].first).to include("label" => "Dune", "count" => 2)
      expect(stats["top_searches"].first).to include("term" => "sci-fi", "count" => 1)
      expect(stats["active_users"].map { |u| u["name"] }).to include(admin.name, customer.name)
    end

    it "orders events most recent first" do
      older = create(:analytics_event, user: customer, created_at: 2.hours.ago)
      newer = create(:analytics_event, user: admin, created_at: 1.minute.ago)

      get "/api/v1/analytics_events", headers: admin_headers

      ids = JSON.parse(response.body).dig("data", "events").map { |e| e["id"] }
      expect(ids).to eq([ newer.id, older.id ])
    end

    it "forbids a non-admin from viewing analytics" do
      get "/api/v1/analytics_events", headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)["error"]).to eq("Admin access required")
    end

    it "requires authentication" do
      get "/api/v1/analytics_events"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
