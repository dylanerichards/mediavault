class Api::V1::MediaTypesController < Api::V1::BaseController
  # STI subclasses this API is allowed to list and instantiate. Anything not in
  # this list is rejected before `constantize`, so arbitrary classes can't be
  # created through the type parameter.
  ALLOWED_TYPES = %w[Book Podcast].freeze

  before_action :require_admin, only: [ :create, :update, :destroy ]
  before_action :set_media_type, only: [ :show, :update, :destroy ]

  def index
    # Eager-load book associations to avoid N+1 when serializing the list.
    media_types = MediaType.includes(:author, :publisher)

    media_types = media_types.where(type: params[:type]) if allowed_type?(params[:type])
    media_types = media_types.where("title LIKE ?", "%#{params[:search]}%") if params[:search].present?
    media_types = media_types.where(author_id: params[:author_id]) if params[:author_id].present?
    media_types = media_types.where(publisher_id: params[:publisher_id]) if params[:publisher_id].present?

    result = paginate_collection(media_types)

    render_success({
      media_types: result[:items].map { |media_type| media_type_data(media_type) },
      pagination: result[:pagination]
    })
  end

  def show
    render_success({ media_type: media_type_data(@media_type) })
  end

  def create
    type = params.dig(:media_type, :type)

    unless allowed_type?(type)
      return render_error("Media type creation failed", :unprocessable_entity,
        [ "type must be one of: #{ALLOWED_TYPES.join(', ')}" ])
    end

    media_type = type.constantize.new(media_type_params(type))

    if media_type.save
      render_success({ media_type: media_type_data(media_type) }, "#{type} created successfully", :created)
    else
      render_error("Media type creation failed", :unprocessable_entity, media_type.errors.full_messages)
    end
  end

  def update
    if @media_type.update(media_type_params(@media_type.type))
      render_success({ media_type: media_type_data(@media_type) }, "#{@media_type.type} updated successfully")
    else
      render_error("Media type update failed", :unprocessable_entity, @media_type.errors.full_messages)
    end
  end

  def destroy
    type = @media_type.type
    @media_type.destroy
    render_success(nil, "#{type} deleted successfully")
  end

  private

  def set_media_type
    @media_type = MediaType.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Media type")
  end

  def allowed_type?(type)
    type.present? && ALLOWED_TYPES.include?(type)
  end

  # Permits the shared attributes plus the ones specific to the given type.
  def media_type_params(type)
    permitted = [ :title, :price ]
    permitted += case type
    when "Book" then [ :isbn, :publication_year, :author_id, :publisher_id ]
    when "Podcast" then [ :host, :episode_count ]
    else []
    end

    params.require(:media_type).permit(*permitted)
  end
end
