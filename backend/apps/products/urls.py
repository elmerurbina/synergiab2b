from django.urls import path
from .views import (
    ProductoListView, ProductoDetailView, ProductoCreateView,
    ProductoUpdateView, ProductoDeleteView, ProductoPatrocinadoListView,
    ImagenProductoView, EtiquetaListView, ProductoProveedorView
)

urlpatterns = [
    # Products
    path('', ProductoListView.as_view(), name='product-list'),
    path('patrocinados/', ProductoPatrocinadoListView.as_view(), name='product-sponsored'),
    path('mis-productos/', ProductoProveedorView.as_view(), name='my-products'),
    path('crear/', ProductoCreateView.as_view(), name='product-create'),
    path('<int:pk>/', ProductoDetailView.as_view(), name='product-detail'),
    path('<int:pk>/editar/', ProductoUpdateView.as_view(), name='product-update'),
    path('<int:pk>/eliminar/', ProductoDeleteView.as_view(), name='product-delete'),
    
    # Images
    path('imagenes/', ImagenProductoView.as_view(), name='image-create'),
    path('imagenes/<int:pk>/', ImagenProductoView.as_view(), name='image-delete'),
    
    # Tags
    path('etiquetas/', EtiquetaListView.as_view(), name='tag-list'),
]