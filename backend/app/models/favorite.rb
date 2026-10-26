class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :media_type

  validates :user_id, uniqueness: { scope: :media_type_id, message: "Item is already in favorites" }
end
