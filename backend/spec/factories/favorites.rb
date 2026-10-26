FactoryBot.define do
  factory :favorite do
    association :user
    association :media_type, factory: :book
  end
end
