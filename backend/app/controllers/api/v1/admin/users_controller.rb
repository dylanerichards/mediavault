class Api::V1::Admin::UsersController < Api::V1::BaseController
  before_action :require_admin
  before_action :set_user, only: [ :show ]

  def index
    users = User.all
    users = users.where("name LIKE ? OR email LIKE ?", "%#{params[:search]}%", "%#{params[:search]}%") if params[:search].present?
    users = users.where(role: params[:role]) if params[:role].present?

    result = paginate_collection(users)

    render_success({
      users: result[:items].map { |user| user_data(user) },
      pagination: result[:pagination]
    })
  end

  def show
    render_success({ user: detailed_user_data(@user) })
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_not_found("User")
  end

  def user_data(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }
  end

  def detailed_user_data(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      favorites_count: user.favorites.count,
      cart_items_count: user.cart_items.count,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  end
end
