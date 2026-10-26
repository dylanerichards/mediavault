require 'rails_helper'

RSpec.describe Api::V1::FavoritesController, type: :controller do
  let(:user) { create(:user) }
  let!(:book) { create(:book) }
  let!(:favorite) { create(:favorite, user: user, media_type: book) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #index' do
    it 'returns user favorites with media type data' do
      get :index

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['favorites']).to be_an(Array)
      expect(json['data']['favorites'].length).to eq(1)
      expect(json['data']['favorites'].first['media_type']['title']).to eq(book.title)
      expect(json['data']['favorites'].first['media_type']['type']).to eq('Book')
    end
  end

  describe 'POST #create' do
    let(:new_book) { create(:book) }

    context 'with valid media_type_id' do
      it 'creates a new favorite' do
        expect {
          post :create, params: { media_type_id: new_book.id }
        }.to change(user.favorites, :count).by(1)
      end

      it 'returns created favorite data' do
        post :create, params: { media_type_id: new_book.id }

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['favorite']['media_type']['id']).to eq(new_book.id)
        expect(json['message']).to eq('Added to favorites')
      end
    end

    context 'with duplicate media type' do
      it 'returns validation error' do
        post :create, params: { media_type_id: book.id }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Failed to add to favorites')
        expect(json['errors'].join).to include('Item is already in favorites')
      end
    end

    context 'with non-existent media type' do
      it 'returns not found error' do
        post :create, params: { media_type_id: 99999 }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Media type not found')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'with user\'s own favorite' do
      it 'deletes the favorite' do
        expect {
          delete :destroy, params: { id: favorite.id }
        }.to change(user.favorites, :count).by(-1)
      end

      it 'returns success message' do
        delete :destroy, params: { id: favorite.id }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Removed from favorites')
      end
    end

    context 'with non-existent favorite' do
      it 'returns not found error' do
        delete :destroy, params: { id: 99999 }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Favorite not found')
      end
    end
  end
end
