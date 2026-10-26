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

  # Serializes any media type. Common fields are always present; each subclass
  # merges in its own format-specific details.
  def media_type_data(media_type)
    data = {
      id: media_type.id,
      type: media_type.type,
      title: media_type.title,
      price: media_type.price.to_f,
      created_at: media_type.created_at,
      updated_at: media_type.updated_at
    }

    data.merge!(book_details(media_type)) if media_type.is_a?(Book)
    data.merge!(podcast_details(media_type)) if media_type.is_a?(Podcast)

    data
  end

  def book_details(book)
    {
      isbn: book.isbn,
      publication_year: book.publication_year,
      author: { id: book.author.id, name: book.author.name },
      publisher: { id: book.publisher.id, name: book.publisher.name }
    }
  end

  def podcast_details(podcast)
    {
      host: podcast.host,
      episode_count: podcast.episode_count
    }
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
