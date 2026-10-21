class CreateBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :books do |t|
      t.string :title
      t.string :isbn
      # Max: 999999.99 (8 total digits, 2 after decimal)
      t.decimal :price, precision: 8, scale: 2
      t.integer :publication_year
      t.references :author, null: false, foreign_key: true
      t.references :publisher, null: false, foreign_key: true

      t.timestamps
    end
  end
end
