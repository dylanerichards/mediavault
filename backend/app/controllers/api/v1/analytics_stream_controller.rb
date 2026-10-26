class Api::V1::AnalyticsStreamController < ApplicationController
  # Server-Sent Events stream of analytics actions for the admin dashboard.
  # Kept in its own controller so ActionController::Live only affects this
  # streaming action, not the regular JSON endpoints.
  include ActionController::Live

  # EventSource (the browser client) can't send an Authorization header, so
  # this action authenticates from a `token` query param instead of the usual
  # header-based flow.
  skip_before_action :authenticate_request
  skip_before_action :set_current_user
  before_action :authenticate_admin_from_token

  POLL_INTERVAL = 2 # seconds

  # GET /api/v1/analytics_events/stream?token=<jwt>&last_id=<id>
  def show
    response.headers["Content-Type"] = "text/event-stream"
    response.headers["Cache-Control"] = "no-cache"
    response.headers["X-Accel-Buffering"] = "no" # don't let proxies buffer

    sse = ActionController::Live::SSE.new(response.stream, retry: 3000)
    last_id = params[:last_id].to_i

    loop do
      AnalyticsEvent.includes(:user).where("id > ?", last_id).order(:id).limit(100).each do |event|
        last_id = event.id
        sse.write(event.to_event_hash, event: "analytics_event")
      end

      # Heartbeat so a disconnected client is detected (write then raises).
      sse.write({ t: Time.current.to_i }, event: "heartbeat")
      sleep POLL_INTERVAL
    end
  rescue ActionController::Live::ClientDisconnected, IOError
    # Client closed the connection; nothing to do.
  ensure
    sse&.close
  end

  private

  def authenticate_admin_from_token
    decoded = JWT.decode(params[:token], Rails.application.secret_key_base, true, algorithm: "HS256")
    user = User.find(decoded[0]["user_id"])
    head :forbidden unless user.admin?
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    head :unauthorized
  end
end
