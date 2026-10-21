class Api::V1::BooksController < Api::V1::BaseController
  before_action :require_admin, only: [ :create, :update, :destroy ]
  before_action :set_book, only: [ :show, :update, :destroy ]

  def index
    books = Book.includes(:author, :publisher)
    books = books.where("title LIKE ?", "%#{params[:search]}%") if params[:search].present?
    books = books.where(author_id: params[:author_id]) if params[:author_id].present?
    books = books.where(publisher_id: params[:publisher_id]) if params[:publisher_id].present?

    result = paginate_collection(books)

    render_success({
      books: result[:items].map { |book| book_data(book) },
      pagination: result[:pagination]
    })
  end

  def show
    render_success({ book: book_data(@book) })
  end

  def create
    book = Book.new(book_params)

    if book.save
      render_success({ book: book_data(book) }, "Book created successfully", :created)
    else
      render_error("Book creation failed", :unprocessable_content, book.errors.full_messages)
    end
  end

  def update
    if @book.update(book_params)
      render_success({ book: book_data(@book) }, "Book updated successfully")
    else
      render_error("Book update failed", :unprocessable_entity, @book.errors.full_messages)
    end
  end

  def destroy
    @book.destroy
    render_success(nil, "Book deleted successfully")
  end

  private

  def set_book
    @book = Book.includes(:author, :publisher).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Book")
  end

  def book_params
    params.require(:book).permit(:title, :isbn, :price, :publication_year, :author_id, :publisher_id)
  end

  def book_data(book)
    {
      id: book.id,
      title: book.title,
      isbn: book.isbn,
      price: book.price.to_f,
      publication_year: book.publication_year,
      author: {
        id: book.author.id,
        name: book.author.name
      },
      publisher: {
        id: book.publisher.id,
        name: book.publisher.name
      },
      created_at: book.created_at,
      updated_at: book.updated_at
    }
  end
end
