class ApplicationController < ActionController::API
  before_action :authenticate_request
  before_action :set_current_user

  rescue_from ActionController::ParameterMissing, with: :handle_parameter_missing

  private

  def authenticate_request
    header = request.headers["Authorization"]
    token = header.split(" ").last if header

    begin
      decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: "HS256")
      @current_user_id = decoded[0]["user_id"]
    rescue JWT::DecodeError => e
      render json: { error: "Invalid token" }, status: :unauthorized
    rescue => e
      render json: { error: "Authentication failed" }, status: :unauthorized
    end
  end

  def set_current_user
    @current_user = User.find(@current_user_id) if @current_user_id
  rescue ActiveRecord::RecordNotFound
    render json: { error: "User not found" }, status: :unauthorized
  end

  def current_user
    @current_user
  end

  def require_admin
    unless current_user&.admin?
      render json: { error: "Admin access required" }, status: :forbidden
    end
  end

  def skip_authentication
    skip_before_action :authenticate_request
    skip_before_action :set_current_user
  end

  def handle_parameter_missing(exception)
    render json: { error: exception.message }, status: :bad_request
  end
end
