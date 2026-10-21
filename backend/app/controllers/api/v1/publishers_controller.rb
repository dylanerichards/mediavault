class Api::V1::PublishersController < Api::V1::BaseController
  before_action :require_admin, only: [ :create, :update, :destroy ]
  before_action :set_publisher, only: [ :show, :update, :destroy ]

  def index
    publishers = Publisher.all
    publishers = publishers.where("name LIKE ?", "%#{params[:search]}%") if params[:search].present?

    result = paginate_collection(publishers)

    render_success({
      publishers: result[:items].map { |publisher| publisher_data(publisher) },
      pagination: result[:pagination]
    })
  end

  def show
    render_success({ publisher: publisher_data(@publisher) })
  end

  def create
    publisher = Publisher.new(publisher_params)

    if publisher.save
      render_success({ publisher: publisher_data(publisher) }, "Publisher created successfully", :created)
    else
      render_error("Publisher creation failed", :unprocessable_entity, publisher.errors.full_messages)
    end
  end

  def update
    if @publisher.update(publisher_params)
      render_success({ publisher: publisher_data(@publisher) }, "Publisher updated successfully")
    else
      render_error("Publisher update failed", :unprocessable_entity, @publisher.errors.full_messages)
    end
  end

  def destroy
    @publisher.destroy
    render_success(nil, "Publisher deleted successfully")
  end

  private

  def set_publisher
    @publisher = Publisher.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Publisher")
  end

  def publisher_params
    params.require(:publisher).permit(:name, :country)
  end

  def publisher_data(publisher)
    {
      id: publisher.id,
      name: publisher.name,
      country: publisher.country,
      books_count: publisher.books.count,
      created_at: publisher.created_at,
      updated_at: publisher.updated_at
    }
  end
end
