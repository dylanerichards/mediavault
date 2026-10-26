class AnalyticsEvent < ApplicationRecord
  # The actions the platform tracks. Kept in sync with the frontend analytics
  # module (src/utils/analytics.ts).
  ACTIONS = %w[view_item search add_to_cart remove_from_cart add_to_favorite remove_from_favorite].freeze

  belongs_to :user

  validates :action, presence: true, inclusion: { in: ACTIONS }

  # Shared serialization used by both the REST endpoint and the SSE stream.
  def to_event_hash
    {
      id: id,
      action: action,
      target_type: target_type,
      target_id: target_id,
      target_label: target_label,
      search_term: search_term,
      user: { id: user_id, name: user.name },
      created_at: created_at
    }
  end
end
