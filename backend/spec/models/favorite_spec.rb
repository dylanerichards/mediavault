require 'rails_helper'

RSpec.describe Favorite, type: :model do
  subject { build(:favorite) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:media_type) }
  end

  describe 'validations' do
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:media_type_id).with_message("Item is already in favorites") }
  end
end
