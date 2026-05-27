from django.urls import path
from .views import (
    InteraccionCreateView, EstadisticasView, ProductoEstadisticasView,
    ValoracionCreateUpdateView, ValoracionListView, ValoracionDeleteView,
    ValoracionUsuarioProductoView, ValoracionUsuarioListView
)

urlpatterns = [
    path('registrar/', InteraccionCreateView.as_view(), name='interaction-create'),
    path('estadisticas/', EstadisticasView.as_view(), name='stats-global'),
    path('estadisticas/producto/<int:producto_id>/', ProductoEstadisticasView.as_view(), name='stats-product'),
    path('valoraciones/', ValoracionListView.as_view(), name='valoracion-list'),
    path('valoraciones/crear/', ValoracionCreateUpdateView.as_view(), name='valoracion-create-update'),
    path('valoraciones/eliminar/<int:producto_id>/', ValoracionDeleteView.as_view(), name='valoracion-delete'),
    path('valoraciones/producto/<int:producto_id>/', ValoracionUsuarioProductoView.as_view(), name='valoracion-usuario-producto'),
    path('valoraciones/mis-valoraciones/', ValoracionUsuarioListView.as_view(), name='valoracion-usuario-list'),
]