require 'rails_helper'

RSpec.describe Api::V1::PublishersController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:customer_user) { create(:user) }
  let!(:publisher) { create(:publisher) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
  end

  describe 'GET #index' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns paginated publishers' do
      get :index

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['publishers']).to be_an(Array)
      expect(json['data']['pagination']).to be_present
    end
  end

  describe 'GET #show' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns publisher data' do
      get :show, params: { id: publisher.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['publisher']['id']).to eq(publisher.id)
      expect(json['data']['publisher']['name']).to eq(publisher.name)
    end
  end

  describe 'POST #create' do
    context 'as admin user' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }

      let(:valid_params) do
        {
          publisher: {
            name: 'New Publisher',
            country: 'United States'
          }
        }
      end

      it 'creates a new publisher' do
        expect {
          post :create, params: valid_params
        }.to change(Publisher, :count).by(1)
      end

      it 'returns created publisher data' do
        post :create, params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['publisher']['name']).to eq('New Publisher')
        expect(json['message']).to eq('Publisher created successfully')
      end
    end

    context 'as customer user' do
      before { allow(controller).to receive(:current_user).and_return(customer_user) }

      it 'returns forbidden error' do
        post :create, params: { publisher: { name: 'Test' } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
