require 'rails_helper'

RSpec.describe Book, type: :model do
  subject { build(:book) }

  describe 'associations' do
    it { is_expected.to belong_to(:author) }
    it { is_expected.to belong_to(:publisher) }
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_many(:cart_items).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_least(1).is_at_most(200) }

    it { is_expected.to validate_presence_of(:isbn) }
    it { is_expected.to validate_uniqueness_of(:isbn).case_insensitive }
    it { is_expected.to allow_value('9780747532699').for(:isbn) }
    it { is_expected.not_to allow_value('invalid').for(:isbn) }

    it { is_expected.to validate_presence_of(:price) }
    it { is_expected.to validate_numericality_of(:price).is_greater_than(0) }

    it { is_expected.to validate_presence_of(:publication_year) }
    it { is_expected.to validate_numericality_of(:publication_year).is_greater_than(1000).is_less_than_or_equal_to(Date.current.year) }
  end

  describe 'price handling' do
    it 'stores price as BigDecimal' do
      book = build(:book, price: 19.99)
      expect(book.price).to be_a(BigDecimal)
      expect(book.price.to_s).to eq('19.99')
    end

    it 'handles decimal precision correctly' do
      book = create(:book, price: 123.45)
      book.reload
      expect(book.price).to eq(BigDecimal('123.45'))
    end
  end
end
