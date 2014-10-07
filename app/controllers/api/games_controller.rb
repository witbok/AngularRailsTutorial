class Api::GamesController < Api::BaseController
  def index
    respond_with :api, games
  end

  def show
    respond_with :api, game
  end

  private

  def games
    @games ||= Game.all
  end

  def game
    @game ||= Game.find(params[:id])
  end
end
