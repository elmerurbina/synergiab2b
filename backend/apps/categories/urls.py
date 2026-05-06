from django.urls import path
from . import views

urlpatterns = [
    path('', views.CategoriaListView.as_view(), name='categoria-list'),
    path('crear/', views.CategoriaCreateView.as_view(), name='categoria-create'),  # ADD THIS LINE
    path('<slug:slug>/', views.CategoriaDetailView.as_view(), name='categoria-detail'),
    path('<slug:slug>/productos/', views.CategoriaProductosView.as_view(), name='categoria-productos'),
    path('subcategorias/<int:parent_id>/', views.SubcategoriaListView.as_view(), name='subcategorias'),
]