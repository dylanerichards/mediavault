Rails.application.routes.draw do
  # Health check endpoint
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      post "auth/login", to: "auth#login"
      post "auth/register", to: "auth#register"
      delete "auth/logout", to: "auth#logout"

      # User profile routes
      get "profile", to: "users#show"
      patch "profile", to: "users#update"

      # Book management routes
      resources :books, only: [ :index, :show, :create, :update, :destroy ]
      resources :authors, only: [ :index, :show, :create, :update, :destroy ]
      resources :publishers, only: [ :index, :show, :create, :update, :destroy ]

      # User interaction routes
      resources :favorites, only: [ :index, :create, :destroy ]
      resources :cart_items, only: [ :index, :create, :update, :destroy ]

      # Admin routes
      namespace :admin do
        resources :users, only: [ :index, :show ]
      end
    end
  end
end
