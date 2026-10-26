FactoryBot.define do
  factory :cart_item do
    association :user
    association :media_type, factory: :book
    quantity { 2 }
  end
end
