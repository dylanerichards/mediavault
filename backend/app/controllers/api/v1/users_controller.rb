class Api::V1::UsersController < Api::V1::BaseController
  def show
    render_success({
      user: user_data(current_user)
    })
  end

  def update
    if current_user.update(user_update_params)
      render_success({
        user: user_data(current_user)
      }, "Profile updated successfully")
    else
      render_error("Profile update failed", :unprocessable_entity, current_user.errors.full_messages)
    end
  end

  private

  def user_update_params
    params.require(:user).permit(:name, :email)
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
end
