require 'rails_helper'

RSpec.describe CartItem, type: :model do
  subject { build(:cart_item) }

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:media_type) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:quantity) }
    it { is_expected.to validate_numericality_of(:quantity).only_integer.is_greater_than(0) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:media_type_id).with_message("Item is already in cart") }
  end

  describe '#total_price' do
    it 'calculates total price correctly' do
      book = create(:book, price: 19.99)
      cart_item = create(:cart_item, media_type: book, quantity: 3)

      expect(cart_item.total_price).to eq(BigDecimal('59.97'))
    end
  end
end
