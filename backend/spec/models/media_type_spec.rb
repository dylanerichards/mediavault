require 'rails_helper'

RSpec.describe MediaType, type: :model do
  # MediaType is an STI base class whose `type` column is NOT NULL at the DB
  # level, so we lean on shoulda-matchers (which validate without persisting)
  # and use a concrete Book subject for the matchers to build from.
  subject { build(:book) }

  describe 'associations' do
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_many(:cart_items).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_least(1).is_at_most(200) }

    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }
  end
end
