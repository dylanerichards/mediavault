require 'rails_helper'

RSpec.describe Favorite, type: :model do
  subject { build(:favorite) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:book) }
  end

  describe 'validations' do
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:book_id).with_message("Book is already in favorites") }
  end
end
