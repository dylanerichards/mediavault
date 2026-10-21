class Publisher < ApplicationRecord
  has_many :books, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :country, length: { maximum: 50 }
end
