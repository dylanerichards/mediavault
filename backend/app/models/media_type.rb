class MediaType < ApplicationRecord
  # STI base class. The `type` column stores the subclass name (Book, Podcast, ...).
  # Only attributes and behavior shared by every media type live here; anything
  # specific to a format belongs on its subclass.
  # Declared on the base (optional) so a mixed STI collection can eager-load
  # them in one query. Book redefines them as required; other types leave the
  # columns null.
  belongs_to :author, optional: true
  belongs_to :publisher, optional: true

  has_many :favorites, dependent: :destroy
  has_many :cart_items, dependent: :destroy

  validates :title, presence: true, length: { minimum: 1, maximum: 200 }
  validates :price, presence: true, numericality: { greater_than: 0 }
end
