class Podcast < MediaType
  validates :host, presence: true, length: { minimum: 1, maximum: 200 }
  validates :episode_count, presence: true, numericality: { greater_than_or_equal_to: 0, only_integer: true }
end
