# BookVault Database Seeds
# This file creates sample data for the interview application
# Run with: bin/rails db:seed

require 'faker'

puts "Seeding database..."

# Clear existing data (for development)
if Rails.env.development?
  puts "Clearing existing data..."
  CartItem.destroy_all
  Favorite.destroy_all
  MediaType.destroy_all
  Author.destroy_all
  Publisher.destroy_all
  User.destroy_all
end

# Create Admin Users
puts "Creating admin users..."
admin = User.find_or_create_by!(email: 'admin@bookvault.com') do |user|
  user.name = 'Admin User'
  user.password = 'password123'
  user.role = 'admin'
end

User.find_or_create_by!(email: 'dylanerichards@gmail.com') do |user|
  user.name = 'Dylan Richards'
  user.password = 'password123'
  user.role = 'admin'
end

# Create Customer Users
puts "Creating customer users..."
customers = []
5.times do
  customers << User.create!(
    name: Faker::Name.name,
    email: Faker::Internet.unique.email,
    password: 'password123',
    role: 'customer'
  )
end

# Create Publishers
puts "Creating publishers..."
publishers = []
publishers_data = [
  { name: 'Penguin Random House', country: 'United States' },
  { name: 'HarperCollins', country: 'United States' },
  { name: 'Macmillan Publishers', country: 'United Kingdom' },
  { name: 'Simon & Schuster', country: 'United States' },
  { name: 'Hachette Book Group', country: 'France' },
  { name: 'Bloomsbury Publishing', country: 'United Kingdom' },
  { name: 'Scholastic Corporation', country: 'United States' },
  { name: 'Pearson Education', country: 'United Kingdom' }
]

publishers_data.each do |pub_data|
  publishers << Publisher.find_or_create_by!(name: pub_data[:name]) do |publisher|
    publisher.country = pub_data[:country]
  end
end

# Create Authors
puts "Creating authors..."
authors = []
authors_data = [
  { name: 'J.K. Rowling', bio: 'British author best known for the Harry Potter series.' },
  { name: 'Stephen King', bio: 'American author of horror, supernatural fiction, suspense, and fantasy novels.' },
  { name: 'Agatha Christie', bio: 'English writer known for her detective novels featuring Hercule Poirot and Miss Marple.' },
  { name: 'George R.R. Martin', bio: 'American novelist and short story writer, best known for A Song of Ice and Fire.' },
  { name: 'Jane Austen', bio: 'English novelist known for her social commentary and wit in romantic fiction.' },
  { name: 'Ernest Hemingway', bio: 'American journalist, novelist, and short-story writer.' },
  { name: 'Maya Angelou', bio: 'American poet, memoirist, and civil rights activist.' },
  { name: 'Toni Morrison', bio: 'American novelist, essayist, and professor, Nobel Prize winner.' },
  { name: 'Harper Lee', bio: 'American novelist widely known for To Kill a Mockingbird.' },
  { name: 'F. Scott Fitzgerald', bio: 'American novelist and short story writer of the Jazz Age.' }
]

authors_data.each do |author_data|
  authors << Author.find_or_create_by!(name: author_data[:name]) do |author|
    author.bio = author_data[:bio]
  end
end

# Add some additional random authors
10.times do
  authors << Author.create!(
    name: Faker::Book.unique.author,
    bio: Faker::Lorem.paragraph(sentence_count: 3)
  )
end

# Create Books
puts "Creating books..."
books = []

# Create some well-known books
famous_books = [
  { title: 'Harry Potter and the Philosopher\'s Stone', isbn: '9780747532699', price: 19.99, year: 1997, author: 'J.K. Rowling' },
  { title: 'The Shining', isbn: '9780385121675', price: 15.99, year: 1977, author: 'Stephen King' },
  { title: 'Murder on the Orient Express', isbn: '9780062693662', price: 14.99, year: 1934, author: 'Agatha Christie' },
  { title: 'A Game of Thrones', isbn: '9780553103540', price: 24.99, year: 1996, author: 'George R.R. Martin' },
  { title: 'Pride and Prejudice', isbn: '9780141439518', price: 12.99, year: 1813, author: 'Jane Austen' },
  { title: 'The Old Man and the Sea', isbn: '9780684801223', price: 13.99, year: 1952, author: 'Ernest Hemingway' },
  { title: 'I Know Why the Caged Bird Sings', isbn: '9780345514400', price: 16.99, year: 1969, author: 'Maya Angelou' },
  { title: 'Beloved', isbn: '9781400033416', price: 17.99, year: 1987, author: 'Toni Morrison' },
  { title: 'To Kill a Mockingbird', isbn: '9780061120084', price: 14.99, year: 1960, author: 'Harper Lee' },
  { title: 'The Great Gatsby', isbn: '9780743273565', price: 13.99, year: 1925, author: 'F. Scott Fitzgerald' }
]

famous_books.each do |book_data|
  author = authors.find { |a| a.name == book_data[:author] }
  next unless author

  books << Book.create!(
    title: book_data[:title],
    isbn: book_data[:isbn],
    price: book_data[:price],
    publication_year: book_data[:year],
    author: author,
    publisher: publishers.sample
  )
end

# Create additional random books
40.times do |i|
  books << Book.create!(
    title: Faker::Book.unique.title,
    isbn: "97807475%05d" % (32000 + i),
    price: Faker::Commerce.price(range: 9.99..79.99),
    publication_year: Faker::Date.between(from: '1950-01-01', to: Date.current).year,
    author: authors.sample,
    publisher: publishers.sample
  )
end

# Create Podcasts
puts "Creating podcasts..."
podcasts = []

famous_podcasts = [
  { title: 'Serial', host: 'Sarah Koenig', episode_count: 12, price: 0.0 },
  { title: 'This American Life', host: 'Ira Glass', episode_count: 820, price: 0.0 },
  { title: 'Radiolab', host: 'Lulu Miller', episode_count: 350, price: 4.99 },
  { title: 'The Daily', host: 'Michael Barbaro', episode_count: 1800, price: 0.0 },
  { title: 'Reply All', host: 'PJ Vogt', episode_count: 187, price: 2.99 },
  { title: 'Hardcore History', host: 'Dan Carlin', episode_count: 72, price: 9.99 },
  { title: 'Planet Money', host: 'Robert Smith', episode_count: 1600, price: 0.0 },
  { title: 'Freakonomics Radio', host: 'Stephen Dubner', episode_count: 560, price: 3.99 },
  { title: '99% Invisible', host: 'Roman Mars', episode_count: 560, price: 4.99 },
  { title: 'Science Vs', host: 'Wendy Zukerman', episode_count: 210, price: 2.99 }
]

famous_podcasts.each do |podcast_data|
  podcasts << Podcast.create!(
    title: podcast_data[:title],
    host: podcast_data[:host],
    episode_count: podcast_data[:episode_count],
    price: podcast_data[:price].positive? ? podcast_data[:price] : 1.99
  )
end

# Create additional random podcasts
15.times do
  podcasts << Podcast.create!(
    title: Faker::Book.unique.title,
    host: Faker::Name.name,
    episode_count: rand(1..500),
    price: Faker::Commerce.price(range: 0.99..14.99)
  )
end

# All media (books + podcasts) can be favorited or carted.
media = books + podcasts

# Create Favorites for customers
puts "Creating user favorites..."
customers.each do |customer|
  # Each customer favorites 2-5 random media items
  media.sample(rand(2..5)).each do |item|
    Favorite.find_or_create_by(user: customer, media_type: item)
  end
end

# Create Cart Items for customers
puts "Creating cart items..."
customers.each do |customer|
  # Each customer has 1-3 media items in cart
  media.sample(rand(1..3)).each do |item|
    CartItem.find_or_create_by(user: customer, media_type: item) do |cart_item|
      cart_item.quantity = rand(1..3)
    end
  end
end

puts "Database seeded successfully!"
puts ""
puts "Summary:"
puts "  Users: #{User.count} (1 admin, #{User.customer.count} customers)"
puts "  Authors: #{Author.count}"
puts "  Publishers: #{Publisher.count}"
puts "  Books: #{Book.count}"
puts "  Podcasts: #{Podcast.count}"
puts "  Favorites: #{Favorite.count}"
puts "  Cart Items: #{CartItem.count}"
puts ""
puts "Login credentials:"
puts "  Admin: admin@bookvault.com / password123"
puts "  Customer examples:"
customers.first(3).each do |customer|
  puts "    #{customer.email} / password123"
end
