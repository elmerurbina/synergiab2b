from django.urls import path
from .views import CategoriaListView, CategoriaDetailView, SubcategoriaListView

urlpatterns = [
    path('', CategoriaListView.as_view(), name='category-list'),
    path('<slug:slug>/', CategoriaDetailView.as_view(), name='category-detail'),
    path('subcategorias/<int:parent_id>/', SubcategoriaListView.as_view(), name='subcategory-list'),
]