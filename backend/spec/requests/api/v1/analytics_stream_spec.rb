require 'rails_helper'

RSpec.describe "Analytics stream (SSE)", type: :request do
  let(:admin) { create(:user, :admin) }
  let(:customer) { create(:user) }

  def token_for(user)
    auth_headers_for(user)["Authorization"].split(" ").last
  end

  describe "GET /api/v1/analytics_events/stream" do
    it "returns 401 without a token" do
      get "/api/v1/analytics_events/stream"
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 401 for an invalid token" do
      get "/api/v1/analytics_events/stream", params: { token: "not-a-jwt" }
      expect(response).to have_http_status(:unauthorized)
    end

    it "returns 403 for a non-admin token" do
      get "/api/v1/analytics_events/stream", params: { token: token_for(customer) }
      expect(response).to have_http_status(:forbidden)
    end
  end
end
