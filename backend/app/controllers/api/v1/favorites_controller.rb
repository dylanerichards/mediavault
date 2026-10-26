class Api::V1::FavoritesController < Api::V1::BaseController
  def index
    favorites = current_user.favorites.includes(:media_type)

    render_success({
      favorites: favorites.map { |favorite| favorite_data(favorite) }
    })
  end

  def create
    media_type = MediaType.find(favorite_params[:media_type_id])
    favorite = current_user.favorites.build(media_type: media_type)

    if favorite.save
      render_success({ favorite: favorite_data(favorite) }, "Added to favorites", :created)
    else
      render_error("Failed to add to favorites", :unprocessable_entity, favorite.errors.full_messages)
    end
  rescue ActiveRecord::RecordNotFound
    render_not_found("Media type")
  end

  def destroy
    favorite = current_user.favorites.find(params[:id])
    favorite.destroy
    render_success(nil, "Removed from favorites")
  rescue ActiveRecord::RecordNotFound
    render_not_found("Favorite")
  end

  private

  def favorite_params
    params.require(:media_type_id)
    params
  end

  def favorite_data(favorite)
    {
      id: favorite.id,
      media_type: media_type_data(favorite.media_type),
      created_at: favorite.created_at
    }
  end
end
