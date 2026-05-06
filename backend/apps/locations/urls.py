from django.urls import path
from .views import (
    UbicacionListView, UbicacionDetailView,
    ProveedorUbicacionView, ProveedorUbicacionDetailView
)

urlpatterns = [
    path('', UbicacionListView.as_view(), name='location-list'),
    path('<int:pk>/', UbicacionDetailView.as_view(), name='location-detail'),
    path('proveedor/', ProveedorUbicacionView.as_view(), name='provider-locations'),
    path('proveedor/<int:pk>/', ProveedorUbicacionDetailView.as_view(), name='provider-location-detail'),
]