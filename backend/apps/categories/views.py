from rest_framework import generics, filters, status
from rest_framework.response import Response  # Add this missing import
from rest_framework.permissions import AllowAny
from django.db.models import Count
from .models import Categoria
from .serializers import CategoriaSerializer
from apps.products.models import Producto


class CategoriaListView(generics.ListAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']
    
    def get_queryset(self):
        queryset = Categoria.objects.filter(activo=True, categoria_padre__isnull=True)
        include_sub = self.request.query_params.get('include_sub', 'false')
        if include_sub.lower() == 'true':
            queryset = queryset.prefetch_related('subcategorias')
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        include_count = request.query_params.get('include_count', 'false')
        if include_count.lower() == 'true':
            for categoria_data in data:
                count = Producto.objects.filter(
                    estado='activo',
                    categoria_id=categoria_data['id']
                ).count()
                categoria_data['productos_count'] = count
        
        return Response(data)


class CategoriaDetailView(generics.RetrieveAPIView):
    queryset = Categoria.objects.filter(activo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'


class SubcategoriaListView(generics.ListAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        parent_id = self.kwargs.get('parent_id')
        return Categoria.objects.filter(categoria_padre_id=parent_id, activo=True)


class CategoriaProductosView(generics.ListAPIView):
    from apps.products.serializers import ProductoListSerializer
    from apps.products.views import ProductPagination
    
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        return Producto.objects.filter(estado='activo', categoria_id=categoria_id)