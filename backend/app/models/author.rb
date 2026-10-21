class Author < ApplicationRecord
  has_many :books, dependent: :destroy

  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :bio, length: { maximum: 1000 }
end
