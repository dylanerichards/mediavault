require 'rails_helper'

RSpec.describe Api::V1::AuthController, type: :controller do
  describe 'POST #register' do
    context 'with valid params' do
      let(:valid_params) do
        {
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123'
          }
        }
      end

      it 'creates a new user' do
        expect {
          post :register, params: valid_params
        }.to change(User, :count).by(1)
      end

      it 'returns user data and token' do
        post :register, params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['user']['email']).to eq('john@example.com')
        expect(json['data']['token']).to be_present
        expect(json['message']).to eq('User registered successfully')
      end
    end

    context 'with invalid params' do
      let(:invalid_params) do
        {
          user: {
            name: '',
            email: 'invalid-email',
            password: 'short'
          }
        }
      end

      it 'does not create a user' do
        expect {
          post :register, params: invalid_params
        }.not_to change(User, :count)
      end

      it 'returns error with validation messages' do
        post :register, params: invalid_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Registration failed')
        expect(json['errors']).to be_present
      end
    end
  end

  describe 'POST #login' do
    let!(:user) { create(:user, email: 'john@example.com', password: 'password123') }

    context 'with valid credentials' do
      let(:valid_params) do
        {
          email: 'john@example.com',
          password: 'password123'
        }
      end

      it 'returns user data and token' do
        post :login, params: valid_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['user']['email']).to eq('john@example.com')
        expect(json['data']['token']).to be_present
        expect(json['message']).to eq('Login successful')
      end
    end

    context 'with invalid credentials' do
      let(:invalid_params) do
        {
          email: 'john@example.com',
          password: 'wrongpassword'
        }
      end

      it 'returns unauthorized error' do
        post :login, params: invalid_params

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid email or password')
      end
    end

    context 'with non-existent user' do
      let(:invalid_params) do
        {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      end

      it 'returns unauthorized error' do
        post :login, params: invalid_params

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Invalid email or password')
      end
    end
  end

  describe 'DELETE #logout' do
    it 'returns success message' do
      delete :logout

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['message']).to eq('Logged out successfully')
    end
  end
end
