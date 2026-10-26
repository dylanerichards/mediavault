class User < ApplicationRecord
  has_secure_password

  has_many :favorites, dependent: :destroy
  has_many :favorite_media_types, through: :favorites, source: :media_type
  has_many :cart_items, dependent: :destroy
  has_many :analytics_events, dependent: :destroy

  enum :role, { customer: 0, admin: 1 }

  validates :name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?

  before_save :downcase_email

  private

  def downcase_email
    self.email = email.downcase if email.present?
  end

  def password_required?
    new_record? || password.present?
  end
end
