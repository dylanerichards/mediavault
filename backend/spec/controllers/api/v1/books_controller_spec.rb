require 'rails_helper'

RSpec.describe Api::V1::BooksController, type: :controller do
  let(:admin_user) { create(:user, :admin) }
  let(:customer_user) { create(:user) }
  let!(:author) { create(:author) }
  let!(:publisher) { create(:publisher) }
  let!(:book) { create(:book, author: author, publisher: publisher) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
  end

  describe 'GET #index' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns paginated books with associated data' do
      get :index

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['books']).to be_an(Array)
      expect(json['data']['books'].first['author']['name']).to eq(author.name)
      expect(json['data']['books'].first['publisher']['name']).to eq(publisher.name)
      expect(json['data']['pagination']).to be_present
    end

    it 'filters books by search term' do
      get :index, params: { search: book.title }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['books'].length).to eq(1)
    end

    it 'filters books by author' do
      get :index, params: { author_id: author.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['books'].length).to eq(1)
    end
  end

  describe 'GET #show' do
    before { allow(controller).to receive(:current_user).and_return(customer_user) }

    it 'returns book with associated data' do
      get :show, params: { id: book.id }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['book']['id']).to eq(book.id)
      expect(json['data']['book']['author']['name']).to eq(author.name)
    end

    it 'returns 404 for non-existent book' do
      get :show, params: { id: 99999 }

      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json['error']).to eq('Book not found')
    end
  end

  describe 'POST #create' do
    context 'as admin user' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }

      let(:valid_params) do
        {
          book: {
            title: 'New Book',
            isbn: '1234567890123',
            price: 29.99,
            publication_year: 2023,
            author_id: author.id,
            publisher_id: publisher.id
          }
        }
      end

      it 'creates a new book' do
        expect {
          post :create, params: valid_params
        }.to change(Book, :count).by(1)
      end

      it 'returns created book data' do
        post :create, params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['book']['title']).to eq('New Book')
        expect(json['message']).to eq('Book created successfully')
      end
    end

    context 'as customer user' do
      before { allow(controller).to receive(:current_user).and_return(customer_user) }

      it 'returns forbidden error' do
        post :create, params: { book: { title: 'Test' } }

        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Admin access required')
      end
    end
  end

  describe 'PATCH #update' do
    context 'as admin user' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }

      let(:update_params) do
        {
          id: book.id,
          book: { title: 'Updated Title' }
        }
      end

      it 'updates the book' do
        patch :update, params: update_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['book']['title']).to eq('Updated Title')
        expect(json['message']).to eq('Book updated successfully')
      end
    end

    context 'as customer user' do
      before { allow(controller).to receive(:current_user).and_return(customer_user) }

      it 'returns forbidden error' do
        patch :update, params: { id: book.id, book: { title: 'Test' } }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'as admin user' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }

      it 'deletes the book' do
        expect {
          delete :destroy, params: { id: book.id }
        }.to change(Book, :count).by(-1)
      end

      it 'returns success message' do
        delete :destroy, params: { id: book.id }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Book deleted successfully')
      end
    end

    context 'as customer user' do
      before { allow(controller).to receive(:current_user).and_return(customer_user) }

      it 'returns forbidden error' do
        delete :destroy, params: { id: book.id }

        expect(response).to have_http_status(:forbidden)
      end
    end
  end
end
