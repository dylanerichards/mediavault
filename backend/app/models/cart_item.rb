class CartItem < ApplicationRecord
  belongs_to :user
  belongs_to :book

  validates :quantity, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :user_id, uniqueness: { scope: :book_id, message: "Book is already in cart" }

  def total_price
    quantity * book.price
  end
end
