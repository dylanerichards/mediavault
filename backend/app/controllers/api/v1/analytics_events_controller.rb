class Api::V1::AnalyticsEventsController < Api::V1::BaseController
  # Viewing analytics is admin-only. Recording events (create) stays open to
  # any authenticated user so their actions can be tracked.
  before_action :require_admin, only: [ :index ]

  # GET /api/v1/analytics_events
  # Returns every user's events across the platform (admin only).
  def index
    scope = AnalyticsEvent.all
    ordered = scope.includes(:user).order(created_at: :desc)
    result = paginate_collection(ordered, 50)

    render_success({
      events: result[:items].map { |event| event_data(event) },
      summary: summary_for(scope),
      stats: stats_for(scope),
      pagination: result[:pagination]
    })
  end

  # POST /api/v1/analytics_events
  def create
    event = current_user.analytics_events.build(event_params)

    if event.save
      render_success({ event: event_data(event) }, "Event recorded", :created)
    else
      render_error("Failed to record event", :unprocessable_entity, event.errors.full_messages)
    end
  end

  private

  def event_params
    params.require(:analytics_event).permit(:action, :target_type, :target_id, :target_label, :search_term)
  end

  def event_data(event)
    event.to_event_hash
  end

  # Counts per action for the given relation, always covering every known
  # action so the client gets a stable, zero-filled shape.
  def summary_for(relation)
    counts = relation.group(:action).count
    AnalyticsEvent::ACTIONS.map do |action|
      { action: action, count: counts[action] || 0 }
    end
  end

  # Richer aggregates for the dashboard: total volume, the most-engaged
  # items, the most common searches, and the most active users.
  def stats_for(relation)
    {
      total: relation.count,
      top_items: relation.where.not(target_label: nil)
                         .group(:target_label)
                         .order(Arel.sql("COUNT(*) DESC"))
                         .limit(5).count
                         .map { |label, count| { label: label, count: count } },
      top_searches: relation.where(action: "search").where.not(search_term: nil)
                            .group(:search_term)
                            .order(Arel.sql("COUNT(*) DESC"))
                            .limit(5).count
                            .map { |term, count| { term: term, count: count } },
      active_users: relation.joins(:user)
                            .group("users.name")
                            .order(Arel.sql("COUNT(*) DESC"))
                            .limit(5).count
                            .map { |name, count| { name: name, count: count } }
    }
  end
end
