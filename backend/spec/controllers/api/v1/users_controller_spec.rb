require 'rails_helper'

RSpec.describe Api::V1::UsersController, type: :controller do
  let(:user) { create(:user) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #show' do
    it 'returns current user data' do
      get :show

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['user']['id']).to eq(user.id)
      expect(json['data']['user']['email']).to eq(user.email)
      expect(json['data']['user']['name']).to eq(user.name)
    end
  end

  describe 'PATCH #update' do
    context 'with valid params' do
      let(:valid_params) do
        {
          user: {
            name: 'Updated Name',
            email: 'updated@example.com'
          }
        }
      end

      it 'updates user data' do
        patch :update, params: valid_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['user']['name']).to eq('Updated Name')
        expect(json['data']['user']['email']).to eq('updated@example.com')
        expect(json['message']).to eq('Profile updated successfully')
      end
    end

    context 'with invalid params' do
      let(:invalid_params) do
        {
          user: {
            name: '',
            email: 'invalid-email'
          }
        }
      end

      it 'returns validation errors' do
        patch :update, params: invalid_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Profile update failed')
        expect(json['errors']).to be_present
      end
    end

    context 'with duplicate email' do
      let!(:other_user) { create(:user, email: 'taken@example.com') }
      let(:duplicate_params) do
        {
          user: {
            email: 'taken@example.com'
          }
        }
      end

      it 'returns validation error' do
        patch :update, params: duplicate_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Profile update failed')
      end
    end
  end
end
