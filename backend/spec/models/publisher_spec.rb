require 'rails_helper'

RSpec.describe Publisher, type: :model do
  subject { build(:publisher) }

  describe 'associations' do
    it { is_expected.to have_many(:books).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_least(2).is_at_most(100) }
    it { is_expected.to validate_length_of(:country).is_at_most(50) }
  end
end
