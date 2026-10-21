class Api::V1::AuthController < Api::V1::BaseController
  skip_before_action :authenticate_request, :set_current_user

  def register
    user = User.new(user_params)

    if user.save
      token = generate_token(user)
      render_success({
        user: user_data(user),
        token: token
      }, "User registered successfully", :created)
    else
      render_error("Registration failed", :unprocessable_entity, user.errors.full_messages)
    end
  end

  def login
    user = User.find_by(email: login_params[:email].downcase)

    if user&.authenticate(login_params[:password])
      token = generate_token(user)
      render_success({
        user: user_data(user),
        token: token
      }, "Login successful")
    else
      render_error("Invalid email or password", :unauthorized)
    end
  end

  def logout
    render_success(nil, "Logged out successfully")
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end

  def login_params
    params.require(:email)
    params.require(:password)
    params
  end

  def generate_token(user)
    payload = {
      user_id: user.id,
      exp: 24.hours.from_now.to_i
    }
    JWT.encode(payload, Rails.application.secret_key_base, "HS256")
  end

  def user_data(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  end
end
