class CreateAnalyticsEvents < ActiveRecord::Migration[8.0]
  # Server-side log of user actions so analytics can be viewed across all
  # users, not just the browser that generated them. Stores full context:
  # who (user), what (action), the target resource, any search term, and a
  # precise timestamp (created_at).
  def change
    create_table :analytics_events do |t|
      t.references :user, null: false, foreign_key: true
      t.string :action, null: false
      t.string :target_type   # e.g. "MediaType" for a viewed/carted item
      t.integer :target_id    # the target resource's id
      t.string :target_label  # human-readable target, e.g. the media title
      t.string :search_term   # the query, for search actions

      t.timestamps
    end

    add_index :analytics_events, :action
    add_index :analytics_events, [ :target_type, :target_id ]
  end
end
