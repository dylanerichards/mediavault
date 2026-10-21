require 'rails_helper'

RSpec.describe User, type: :model do
  subject { build(:user) }

  describe 'associations' do
    it { is_expected.to have_many(:favorites).dependent(:destroy) }
    it { is_expected.to have_many(:favorite_books).through(:favorites).source(:book) }
    it { is_expected.to have_many(:cart_items).dependent(:destroy) }
  end

  describe 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_presence_of(:password) }
    it { is_expected.to validate_length_of(:password).is_at_least(6) }
  end

  describe 'password authentication' do
    let(:user) { create(:user, password: 'secret123') }

    it 'authenticates with correct password' do
      expect(user.authenticate('secret123')).to eq(user)
    end

    it 'returns false with incorrect password' do
      expect(user.authenticate('wrong')).to be false
    end

    it 'stores password as digest, not plaintext' do
      expect(user.password_digest).not_to eq('secret123')
      expect(user.password_digest).to be_present
    end
  end

  describe 'roles' do
    it 'defaults to customer role' do
      user = create(:user)
      expect(user.role).to eq('customer')
    end

    it 'can be set to admin' do
      user = create(:user, :admin)
      expect(user.role).to eq('admin')
    end
  end

  describe 'email normalization' do
    it 'downcases email before saving' do
      user = create(:user, email: 'USER@EXAMPLE.COM')
      expect(user.email).to eq('user@example.com')
    end
  end
end
