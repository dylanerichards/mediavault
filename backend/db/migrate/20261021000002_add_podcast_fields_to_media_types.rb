class AddPodcastFieldsToMediaTypes < ActiveRecord::Migration[8.0]
  # Podcast-specific columns on the shared STI table. Nullable so Book (and any
  # other media type) rows simply leave them unset.
  def change
    add_column :media_types, :host, :string
    add_column :media_types, :episode_count, :integer
  end
end
