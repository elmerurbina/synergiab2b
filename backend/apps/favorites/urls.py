from django.urls import path
from .views import FavoritoListView, FavoritoCreateView, FavoritoDeleteView, FavoritoCheckView, FavoritoCountView

urlpatterns = [
    path('', FavoritoListView.as_view(), name='favorite-list'),
    path('agregar/', FavoritoCreateView.as_view(), name='favorite-add'),
    path('eliminar/<int:producto_id>/', FavoritoDeleteView.as_view(), name='favorite-remove'),
    path('verificar/', FavoritoCheckView.as_view(), name='favorite-check'),
    path('contar/', FavoritoCountView.as_view(), name='favorite-count'),
]