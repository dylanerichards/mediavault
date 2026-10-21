FactoryBot.define do
  factory :cart_item do
    association :user
    association :book
    quantity { 2 }
  end
end
