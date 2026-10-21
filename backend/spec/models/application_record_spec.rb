require 'rails_helper'

# Basic spec to verify RSpec is configured correctly
RSpec.describe ApplicationRecord, type: :model do
  describe 'base model configuration' do
    it 'is an abstract class' do
      expect(ApplicationRecord).to be < ActiveRecord::Base
    end

    it 'has the correct inheritance hierarchy' do
      expect(ApplicationRecord.abstract_class).to be true
    end
  end
end
