require 'rails_helper'

RSpec.describe AnalyticsEvent, type: :model do
  subject { build(:analytics_event) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:action) }
    it { is_expected.to validate_inclusion_of(:action).in_array(AnalyticsEvent::ACTIONS) }

    it 'rejects an action not in ACTIONS' do
      event = build(:analytics_event, action: "foo")
      expect(event).not_to be_valid
      expect(event.errors[:action]).to be_present
    end

    it 'accepts every known action' do
      AnalyticsEvent::ACTIONS.each do |action|
        expect(build(:analytics_event, action: action)).to be_valid
      end
    end
  end
end
