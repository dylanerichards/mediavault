FactoryBot.define do
  sequence(:isbn) { |n| "978074753%04d" % n }

  factory :book do
    title { "Harry Potter and the Philosopher's Stone" }
    isbn { generate(:isbn) }
    price { 19.99 }
    publication_year { 1997 }
    association :author
    association :publisher
  end
end
