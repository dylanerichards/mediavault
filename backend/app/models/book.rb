class Book < MediaType
  belongs_to :author
  belongs_to :publisher

  validates :isbn, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A\d{13}\z/, message: "must be 13 digits" }
  validates :publication_year, presence: true, numericality: { greater_than: 1000, less_than_or_equal_to: Date.current.year }
end
