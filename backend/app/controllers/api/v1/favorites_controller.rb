class Api::V1::FavoritesController < Api::V1::BaseController
  def index
    favorites = current_user.favorites.includes(book: [ :author, :publisher ])

    render_success({
      favorites: favorites.map { |favorite| favorite_data(favorite) }
    })
  end

  def create
    book = Book.find(favorite_params[:book_id])
    favorite = current_user.favorites.build(book: book)

    if favorite.save
      render_success({ favorite: favorite_data(favorite) }, "Book added to favorites", :created)
    else
      render_error("Failed to add to favorites", :unprocessable_entity, favorite.errors.full_messages)
    end
  rescue ActiveRecord::RecordNotFound
    render_not_found("Book")
  end

  def destroy
    favorite = current_user.favorites.find(params[:id])
    favorite.destroy
    render_success(nil, "Book removed from favorites")
  rescue ActiveRecord::RecordNotFound
    render_not_found("Favorite")
  end

  private

  def favorite_params
    params.require(:book_id)
    params
  end

  def favorite_data(favorite)
    {
      id: favorite.id,
      book: {
        id: favorite.book.id,
        title: favorite.book.title,
        isbn: favorite.book.isbn,
        price: favorite.book.price.to_f,
        publication_year: favorite.book.publication_year,
        author: {
          id: favorite.book.author.id,
          name: favorite.book.author.name
        },
        publisher: {
          id: favorite.book.publisher.id,
          name: favorite.book.publisher.name
        }
      },
      created_at: favorite.created_at
    }
  end
end
