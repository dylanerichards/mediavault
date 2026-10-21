require 'rails_helper'

RSpec.describe Api::V1::AuthorsController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:customer_user) { create(:user) }
  let!(:author) { create(:author) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
  end

  describe 'GET #index' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns paginated authors' do
      get :index

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['authors']).to be_an(Array)
      expect(json['data']['pagination']).to be_present
    end

    it 'filters authors by search term' do
      get :index, params: { search: author.name }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['authors'].length).to eq(1)
    end
  end

  describe 'GET #show' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns author data' do
      get :show, params: { id: author.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['author']['id']).to eq(author.id)
      expect(json['data']['author']['name']).to eq(author.name)
    end
  end

  describe 'POST #create' do
    context 'as admin user' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }

      let(:valid_params) do
        {
          author: {
            name: 'New Author',
            bio: 'Author biography'
          }
        }
      end

      it 'creates a new author' do
        expect {
          post :create, params: valid_params
        }.to change(Author, :count).by(1)
      end

      it 'returns created author data' do
        post :create, params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['author']['name']).to eq('New Author')
        expect(json['message']).to eq('Author created successfully')
      end
    end

    context 'as customer user' do
      before { allow(controller).to receive(:current_user).and_return(customer_user) }

      it 'returns forbidden error' do
        post :create, params: { author: { name: 'Test' } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
