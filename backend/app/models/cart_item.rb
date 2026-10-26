class CartItem < ApplicationRecord
  belongs_to :user
  belongs_to :media_type

  validates :quantity, presence: true, numericality: { greater_than: 0, only_integer: true }
  validates :user_id, uniqueness: { scope: :media_type_id, message: "Item is already in cart" }

  def total_price
    quantity * media_type.price
  end
end
