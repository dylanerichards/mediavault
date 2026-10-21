FactoryBot.define do
  factory :user do
    name { "John Doe" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    role { :customer }

    trait :admin do
      role { :admin }
    end

    trait :customer do
      role { :customer }
    end
  end
end
