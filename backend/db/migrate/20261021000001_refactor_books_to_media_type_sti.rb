class RefactorBooksToMediaTypeSti < ActiveRecord::Migration[8.0]
  # Converts the single `books` table into an STI `media_types` table whose
  # base class is MediaType. Book becomes `Book < MediaType`; future media
  # types (e.g. Podcast) are new subclasses on the same table. The cart/
  # favorite join tables are generalized from book_id to media_type_id so any
  # media type can be carted or favorited.
  def up
    # Drop the join-table FKs before renaming their target table.
    remove_foreign_key :cart_items, :books
    remove_foreign_key :favorites, :books

    # books -> media_types, with the STI discriminator column.
    rename_table :books, :media_types
    add_column :media_types, :type, :string
    execute("UPDATE media_types SET type = 'Book'")
    change_column_null :media_types, :type, false
    add_index :media_types, :type

    # author/publisher are Book-specific; other media types leave them null.
    change_column_null :media_types, :author_id, true
    change_column_null :media_types, :publisher_id, true

    # Generalize the join tables to reference any media type.
    rename_column :cart_items, :book_id, :media_type_id
    rename_column :favorites, :book_id, :media_type_id
    add_foreign_key :cart_items, :media_types, column: :media_type_id
    add_foreign_key :favorites, :media_types, column: :media_type_id
  end

  def down
    remove_foreign_key :cart_items, :media_types, column: :media_type_id
    remove_foreign_key :favorites, :media_types, column: :media_type_id
    rename_column :cart_items, :media_type_id, :book_id
    rename_column :favorites, :media_type_id, :book_id

    change_column_null :media_types, :publisher_id, false
    change_column_null :media_types, :author_id, false
    remove_index :media_types, :type
    remove_column :media_types, :type
    rename_table :media_types, :books

    add_foreign_key :cart_items, :books
    add_foreign_key :favorites, :books
  end
end
