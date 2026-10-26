require 'rails_helper'

RSpec.describe "Media types API", type: :request do
  let(:customer) { create(:user) }
  let(:admin) { create(:user, :admin) }
  let(:headers) { auth_headers_for(customer) }
  let(:admin_headers) { auth_headers_for(admin) }

  describe "GET /api/v1/media_types (search)" do
    it "returns the book matching the search term" do
      target = create(:book, title: "The Great Gatsby")
      create(:book, title: "Moby Dick")

      get "/api/v1/media_types", params: { search: "Gatsby" }, headers: headers

      expect(response).to have_http_status(:ok)
      results = JSON.parse(response.body).dig("data", "media_types")
      expect(results.map { |m| m["id"] }).to eq([ target.id ])
      expect(results.first["type"]).to eq("Book")
    end

    it "returns the podcast matching the search term" do
      target = create(:podcast, title: "Serial")
      create(:podcast, title: "Radiolab")

      get "/api/v1/media_types", params: { search: "Serial" }, headers: headers

      expect(response).to have_http_status(:ok)
      results = JSON.parse(response.body).dig("data", "media_types")
      expect(results.map { |m| m["id"] }).to eq([ target.id ])
      expect(results.first["type"]).to eq("Podcast")
      expect(results.first["host"]).to eq(target.host)
    end

    it "returns both media types when unfiltered" do
      create(:book, title: "Dune")
      create(:podcast, title: "The Daily")

      get "/api/v1/media_types", headers: headers

      types = JSON.parse(response.body).dig("data", "media_types").map { |m| m["type"] }
      expect(types).to contain_exactly("Book", "Podcast")
    end

    it "filters by type" do
      book = create(:book, title: "Shared Title")
      create(:podcast, title: "Shared Title")

      get "/api/v1/media_types", params: { search: "Shared", type: "Book" }, headers: headers

      results = JSON.parse(response.body).dig("data", "media_types")
      expect(results.map { |m| m["id"] }).to eq([ book.id ])
    end

    it "requires authentication" do
      get "/api/v1/media_types"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /api/v1/media_types/:id" do
    it "returns a single media type with its subtype fields" do
      podcast = create(:podcast)

      get "/api/v1/media_types/#{podcast.id}", headers: headers

      expect(response).to have_http_status(:ok)
      data = JSON.parse(response.body).dig("data", "media_type")
      expect(data["id"]).to eq(podcast.id)
      expect(data["episode_count"]).to eq(podcast.episode_count)
    end

    it "returns 404 for a missing record" do
      get "/api/v1/media_types/999999", headers: headers
      expect(response).to have_http_status(:not_found)
      expect(JSON.parse(response.body)["error"]).to eq("Media type not found")
    end
  end

  describe "POST /api/v1/media_types" do
    let(:author) { create(:author) }
    let(:publisher) { create(:publisher) }

    it "creates a Book (admin)" do
      params = { media_type: { type: "Book", title: "New Book", isbn: "1234567890123",
                               price: 29.99, publication_year: 2023,
                               author_id: author.id, publisher_id: publisher.id } }

      expect {
        post "/api/v1/media_types", params: params, headers: admin_headers, as: :json
      }.to change(Book, :count).by(1)

      expect(response).to have_http_status(:created)
      data = JSON.parse(response.body).dig("data", "media_type")
      expect(data["type"]).to eq("Book")
      expect(data["isbn"]).to eq("1234567890123")
    end

    it "creates a Podcast (admin)" do
      params = { media_type: { type: "Podcast", title: "New Pod", price: 4.99,
                               host: "Jane Host", episode_count: 7 } }

      expect {
        post "/api/v1/media_types", params: params, headers: admin_headers, as: :json
      }.to change(Podcast, :count).by(1)

      data = JSON.parse(response.body).dig("data", "media_type")
      expect(data["type"]).to eq("Podcast")
      expect(data["host"]).to eq("Jane Host")
    end

    it "rejects an unknown type" do
      post "/api/v1/media_types", params: { media_type: { type: "User", title: "x", price: 1 } },
           headers: admin_headers, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(JSON.parse(response.body)["errors"].join).to include("type must be one of")
    end

    it "forbids non-admins" do
      post "/api/v1/media_types", params: { media_type: { type: "Book", title: "x" } },
           headers: headers, as: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "PATCH /api/v1/media_types/:id" do
    it "updates a record (admin)" do
      book = create(:book, title: "Old")

      patch "/api/v1/media_types/#{book.id}", params: { media_type: { title: "New" } },
            headers: admin_headers, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig("data", "media_type", "title")).to eq("New")
    end

    it "forbids non-admins" do
      book = create(:book)
      patch "/api/v1/media_types/#{book.id}", params: { media_type: { title: "New" } },
            headers: headers, as: :json
      expect(response).to have_http_status(:forbidden)
    end
  end

  describe "DELETE /api/v1/media_types/:id" do
    it "deletes a record (admin)" do
      podcast = create(:podcast)

      expect {
        delete "/api/v1/media_types/#{podcast.id}", headers: admin_headers
      }.to change(Podcast, :count).by(-1)

      expect(response).to have_http_status(:ok)
    end

    it "forbids non-admins" do
      book = create(:book)
      delete "/api/v1/media_types/#{book.id}", headers: headers
      expect(response).to have_http_status(:forbidden)
    end
  end
end
