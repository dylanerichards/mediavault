require 'rails_helper'

RSpec.describe Podcast, type: :model do
  subject { build(:podcast) }

  describe 'validations' do
    it { is_expected.to validate_presence_of(:host) }
    it { is_expected.to validate_length_of(:host).is_at_least(1).is_at_most(200) }

    it { is_expected.to validate_presence_of(:episode_count) }
    it { is_expected.to validate_numericality_of(:episode_count).only_integer.is_greater_than_or_equal_to(0) }

    # Inherited from MediaType
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }
  end
end
