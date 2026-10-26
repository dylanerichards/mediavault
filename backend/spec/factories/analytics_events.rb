FactoryBot.define do
  factory :analytics_event do
    association :user
    action { "view_item" }
    target_type { "Book" }
    target_id { 1 }
    target_label { "The Great Gatsby" }
  end
end
