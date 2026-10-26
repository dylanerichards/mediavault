FactoryBot.define do
  factory :podcast do
    title { "Serial" }
    price { 4.99 }
    host { "Sarah Koenig" }
    episode_count { 12 }
  end
end
