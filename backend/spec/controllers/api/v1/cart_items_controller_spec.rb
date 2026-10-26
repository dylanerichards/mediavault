require 'rails_helper'

RSpec.describe Api::V1::CartItemsController, type: :controller do
  let(:user) { create(:user) }
  let!(:book) { create(:book, price: 19.99) }
  let!(:cart_item) { create(:cart_item, user: user, media_type: book, quantity: 2) }

  before do
    allow(controller).to receive(:authenticate_request)
    allow(controller).to receive(:set_current_user)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #index' do
    it 'returns user cart items with totals' do
      get :index

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['data']['cart_items']).to be_an(Array)
      expect(json['data']['cart_items'].length).to eq(1)
      expect(json['data']['total_price']).to eq(39.98)
      expect(json['data']['total_items']).to eq(2)
    end
  end

  describe 'POST #create' do
    let(:new_book) { create(:book, price: 25.00) }

    context 'with new book' do
      let(:valid_params) do
        {
          media_type_id: new_book.id,
          quantity: 3
        }
      end

      it 'creates a new cart item' do
        expect {
          post :create, params: valid_params
        }.to change(user.cart_items, :count).by(1)
      end

      it 'returns created cart item data' do
        post :create, params: valid_params

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json['data']['cart_item']['quantity']).to eq(3)
        expect(json['data']['cart_item']['total_price']).to eq(75.0)
        expect(json['message']).to eq('Item added to cart')
      end
    end

    context 'with existing book' do
      let(:update_params) do
        {
          media_type_id: book.id,
          quantity: 1
        }
      end

      it 'updates existing cart item quantity' do
        post :create, params: update_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['cart_item']['quantity']).to eq(3) # 2 + 1
        expect(json['message']).to eq('Cart updated successfully')
      end
    end

    context 'with non-existent book' do
      it 'returns not found error' do
        post :create, params: { media_type_id: 99999, quantity: 1 }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Media type not found')
      end
    end

    context 'with invalid quantity' do
      it 'returns validation error' do
        post :create, params: { media_type_id: new_book.id, quantity: 0 }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Failed to add to cart')
      end
    end
  end

  describe 'PATCH #update' do
    context 'with valid quantity' do
      let(:update_params) do
        {
          id: cart_item.id,
          cart_item: { quantity: 5 }
        }
      end

      it 'updates cart item quantity' do
        patch :update, params: update_params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['cart_item']['quantity']).to eq(5)
        expect(json['message']).to eq('Cart item updated successfully')
      end
    end

    context 'with invalid quantity' do
      let(:invalid_params) do
        {
          id: cart_item.id,
          cart_item: { quantity: 0 }
        }
      end

      it 'returns validation error' do
        patch :update, params: invalid_params

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Failed to update cart item')
      end
    end

    context 'with non-existent cart item' do
      it 'returns not found error' do
        patch :update, params: { id: 99999, cart_item: { quantity: 1 } }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Cart item not found')
      end
    end
  end

  describe 'DELETE #destroy' do
    context 'with user\'s own cart item' do
      it 'deletes the cart item' do
        expect {
          delete :destroy, params: { id: cart_item.id }
        }.to change(user.cart_items, :count).by(-1)
      end

      it 'returns success message' do
        delete :destroy, params: { id: cart_item.id }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['message']).to eq('Item removed from cart')
      end
    end

    context 'with non-existent cart item' do
      it 'returns not found error' do
        delete :destroy, params: { id: 99999 }

        expect(response).to have_http_status(:not_found)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('Cart item not found')
      end
    end
  end
end
