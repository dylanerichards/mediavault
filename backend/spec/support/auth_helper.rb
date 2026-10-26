module AuthHelper
  # Logs in through the real auth API and returns the Authorization header,
  # so request specs exercise the same JWT flow a client would.
  def auth_headers_for(user, password: "password123")
    post "/api/v1/auth/login", params: { email: user.email, password: password }, as: :json
    token = JSON.parse(response.body).dig("data", "token")
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include AuthHelper, type: :request
end
