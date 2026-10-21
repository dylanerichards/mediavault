class CreateAuthors < ActiveRecord::Migration[8.0]
  def change
    create_table :authors do |t|
      t.string :name, null: false
      t.text :bio

      t.timestamps
    end

    add_index :authors, :name
  end
end
