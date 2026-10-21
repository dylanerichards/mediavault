class Book < ApplicationRecord
  belongs_to :author
  belongs_to :publisher
  has_many :favorites, dependent: :destroy
  has_many :cart_items, dependent: :destroy

  validates :title, presence: true, length: { minimum: 1, maximum: 200 }
  validates :isbn, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A\d{13}\z/, message: "must be 13 digits" }
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :publication_year, presence: true, numericality: { greater_than: 1000, less_than_or_equal_to: Date.current.year }
end
