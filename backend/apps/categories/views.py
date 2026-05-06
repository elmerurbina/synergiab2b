from rest_framework import generics, filters
from rest_framework.permissions import AllowAny
from django.db.models import Count
from .models import Categoria
from .serializers import CategoriaSerializer
from apps.products.models import Producto


class CategoriaListView(generics.ListAPIView):
    """
    Lista de categorías principales.
    
    Parámetros:
    - include_sub: true/false - Incluir subcategorías
    - include_count: true/false - Incluir conteo de productos
    - search: Buscar por nombre
    """
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
                # Contar productos en esta categoría y subcategorías
                count = Producto.objects.filter(
                    estado='activo',
                    categoria_id=categoria_data['id']
                ).count()
                categoria_data['productos_count'] = count
        
        return Response(data)


class CategoriaDetailView(generics.RetrieveAPIView):
    """
    Detalle de una categoría por slug o ID.
    """
    queryset = Categoria.objects.filter(activo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    lookup_url_kwarg = 'slug'


class SubcategoriaListView(generics.ListAPIView):
    """
    Lista de subcategorías por categoría padre.
    """
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        parent_id = self.kwargs.get('parent_id')
        return Categoria.objects.filter(categoria_padre_id=parent_id, activo=True)


class CategoriaProductosView(generics.ListAPIView):
    """
    Lista de productos por categoría.
    """
    from apps.products.serializers import ProductoListSerializer
    from apps.products.views import ProductPagination
    
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        categoria_id = self.kwargs.get('categoria_id')
        # Incluir productos de la categoría y sus subcategorías
        categoria = Categoria.objects.get(id=categoria_id)
        categorias_ids = [categoria_id] + list(categoria.subcategorias.values_list('id', flat=True))
        return Producto.objects.filter(estado='activo', categoria_id__in=categorias_ids)