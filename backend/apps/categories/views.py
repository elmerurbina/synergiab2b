from rest_framework import generics, filters
from .models import Categoria
from .serializers import CategoriaSerializer


class CategoriaListView(generics.ListAPIView):
    queryset = Categoria.objects.filter(activo=True, categoria_padre__isnull=True)
    serializer_class = CategoriaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        include_sub = self.request.query_params.get('include_sub', 'false')
        if include_sub.lower() == 'true':
            return queryset.prefetch_related('subcategorias')
        return queryset


class CategoriaDetailView(generics.RetrieveAPIView):
    queryset = Categoria.objects.filter(activo=True)
    serializer_class = CategoriaSerializer
    lookup_field = 'slug'


class SubcategoriaListView(generics.ListAPIView):
    serializer_class = CategoriaSerializer
    
    def get_queryset(self):
        parent_id = self.kwargs.get('parent_id')
        return Categoria.objects.filter(categoria_padre_id=parent_id, activo=True)