class Api::V1::BaseController < ApplicationController
  private

  def render_success(data = nil, message = nil, status = :ok)
    response = {}
    response[:data] = data if data
    response[:message] = message if message
    render json: response, status: status
  end

  def render_error(message, status = :unprocessable_entity, errors = nil)
    response = { error: message }
    response[:errors] = errors if errors
    render json: response, status: status
  end

  def render_not_found(resource = "Resource")
    render json: { error: "#{resource} not found" }, status: :not_found
  end

  def paginate_collection(collection, per_page = 20)
    page = [ params[:page]&.to_i || 1, 1 ].max
    per_page = [ params[:per_page]&.to_i || per_page, 100 ].min
    offset = (page - 1) * per_page

    total_count = collection.count
    total_pages = (total_count / per_page.to_f).ceil
    items = collection.limit(per_page).offset(offset)

    {
      items: items,
      pagination: {
        current_page: page,
        total_pages: total_pages,
        total_count: total_count,
        per_page: per_page,
        has_next: page < total_pages,
        has_prev: page > 1
      }
    }
  end
end
