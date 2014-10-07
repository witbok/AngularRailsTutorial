require 'rails_helper'

RSpec.describe Api::GamesController, type: :controller do
  before(:each) do
    request.env["HTTP_ACCEPT"] = 'application/json'
  end

  describe 'GET index' do
    let!(:game) { Game.create!(name: "Test", description: "Test") }
    let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

    it "lists the games" do
      get :index
      expect(JSON.parse(response.body).count).to eq(2)
      expect(JSON.parse(response.body).first["id"]).to eq(game.id)
    end
  end

  describe 'GET show' do
    let!(:game) { Game.create!(name: "Test", description: "Test") }
    let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

    it "shows the game" do
      get :show, id: game2.id
      expect(JSON.parse(response.body)["id"]).to eq(game2.id)
    end
  end
end
