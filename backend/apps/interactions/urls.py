from django.urls import path
from .views import InteraccionCreateView, EstadisticasView, ProductoEstadisticasView

urlpatterns = [
    path('registrar/', InteraccionCreateView.as_view(), name='interaction-create'),
    path('estadisticas/', EstadisticasView.as_view(), name='stats-global'),
    path('estadisticas/producto/<int:producto_id>/', ProductoEstadisticasView.as_view(), name='stats-product'),
]