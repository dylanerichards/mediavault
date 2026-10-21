class Api::V1::AuthorsController < Api::V1::BaseController
  before_action :require_admin, only: [ :create, :update, :destroy ]
  before_action :set_author, only: [ :show, :update, :destroy ]

  def index
    authors = Author.all
    authors = authors.where("name LIKE ?", "%#{params[:search]}%") if params[:search].present?

    result = paginate_collection(authors)

    render_success({
      authors: result[:items].map { |author| author_data(author) },
      pagination: result[:pagination]
    })
  end

  def show
    render_success({ author: author_data(@author) })
  end

  def create
    author = Author.new(author_params)

    if author.save
      render_success({ author: author_data(author) }, "Author created successfully", :created)
    else
      render_error("Author creation failed", :unprocessable_entity, author.errors.full_messages)
    end
  end

  def update
    if @author.update(author_params)
      render_success({ author: author_data(@author) }, "Author updated successfully")
    else
      render_error("Author update failed", :unprocessable_entity, @author.errors.full_messages)
    end
  end

  def destroy
    @author.destroy
    render_success(nil, "Author deleted successfully")
  end

  private

  def set_author
    @author = Author.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Author")
  end

  def author_params
    params.require(:author).permit(:name, :bio)
  end

  def author_data(author)
    {
      id: author.id,
      name: author.name,
      bio: author.bio,
      books_count: author.books.count,
      created_at: author.created_at,
      updated_at: author.updated_at
    }
  end
end
