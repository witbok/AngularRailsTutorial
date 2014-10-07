Rails.application.routes.draw do
  namespace :api do
    resources :games
  end

  get "*path", to: "application#index"
  root 'application#index'
end
