class Api::V1::CartItemsController < Api::V1::BaseController
  before_action :set_cart_item, only: [ :update, :destroy ]

  def index
    cart_items = current_user.cart_items.includes(book: [ :author, :publisher ])
    total_price = cart_items.sum(&:total_price)

    render_success({
      cart_items: cart_items.map { |item| cart_item_data(item) },
      total_price: total_price.to_f,
      total_items: cart_items.sum(:quantity)
    })
  end

  def create
    book = Book.find(cart_create_params[:book_id])
    existing_item = current_user.cart_items.find_by(book: book)

    if existing_item
      existing_item.quantity += cart_create_params[:quantity].to_i
      if existing_item.save
        render_success({ cart_item: cart_item_data(existing_item) }, "Cart updated successfully")
      else
        render_error("Failed to update cart", :unprocessable_entity, existing_item.errors.full_messages)
      end
    else
      cart_item = current_user.cart_items.build(book: book, quantity: cart_create_params[:quantity])
      if cart_item.save
        render_success({ cart_item: cart_item_data(cart_item) }, "Item added to cart", :created)
      else
        render_error("Failed to add to cart", :unprocessable_entity, cart_item.errors.full_messages)
      end
    end
  rescue ActiveRecord::RecordNotFound
    render_not_found("Book")
  end

  def update
    if @cart_item.update(cart_item_params)
      render_success({ cart_item: cart_item_data(@cart_item) }, "Cart item updated successfully")
    else
      render_error("Failed to update cart item", :unprocessable_entity, @cart_item.errors.full_messages)
    end
  end

  def destroy
    @cart_item.destroy
    render_success(nil, "Item removed from cart")
  end

  private

  def set_cart_item
    @cart_item = current_user.cart_items.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("Cart item")
  end

  def cart_item_params
    params.require(:cart_item).permit(:quantity)
  end

  def cart_create_params
    params.require(:book_id)
    params.require(:quantity)
    params
  end

  def cart_item_data(cart_item)
    {
      id: cart_item.id,
      quantity: cart_item.quantity,
      total_price: cart_item.total_price.to_f,
      book: {
        id: cart_item.book.id,
        title: cart_item.book.title,
        isbn: cart_item.book.isbn,
        price: cart_item.book.price.to_f,
        publication_year: cart_item.book.publication_year,
        author: {
          id: cart_item.book.author.id,
          name: cart_item.book.author.name
        },
        publisher: {
          id: cart_item.book.publisher.id,
          name: cart_item.book.publisher.name
        }
      },
      created_at: cart_item.created_at,
      updated_at: cart_item.updated_at
    }
  end
end
