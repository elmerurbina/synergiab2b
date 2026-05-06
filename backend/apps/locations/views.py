from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Q
from rest_framework.pagination import PageNumberPagination
from .models import Ubicacion, ProveedorUbicacion
from .serializers import UbicacionSerializer, ProveedorUbicacionSerializer
from apps.products.models import Producto


class LocationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class UbicacionListView(generics.ListAPIView):
    """
    Lista de todas las ubicaciones (departamentos y municipios).
    
    Parámetros de consulta:
    - page: Número de página
    - page_size: Elementos por página
    - search: Buscar por departamento o municipio
    - departamento: Filtrar por departamento específico
    - ordering: Ordenar por departamento o municipio
    - include_count: Incluir conteo de productos por ubicación
    """
    serializer_class = UbicacionSerializer
    pagination_class = LocationPagination
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['departamento', 'municipio']
    ordering_fields = ['departamento', 'municipio']
    
    def get_queryset(self):
        queryset = Ubicacion.objects.all()
        
        # Filtrar por departamento
        departamento = self.request.query_params.get('departamento')
        if departamento:
            queryset = queryset.filter(departamento__icontains=departamento)
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', 'departamento')
        allowed_orderings = ['departamento', '-departamento', 'municipio', '-municipio']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
        else:
            serializer = self.get_serializer(queryset, many=True)
            data = serializer.data
        
        # Incluir conteo de productos si se solicita
        include_count = request.query_params.get('include_count', 'false')
        if include_count.lower() == 'true':
            for ubicacion_data in data:
                count = Producto.objects.filter(
                    estado='activo',
                    ubicacion_id=ubicacion_data['id']
                ).count()
                ubicacion_data['productos_count'] = count
        
        if page is not None:
            return self.get_paginated_response(data)
        return Response(data)


class UbicacionDetailView(generics.RetrieveAPIView):
    """
    Detalle de una ubicación específica por ID.
    Incluye lista de productos disponibles en esa ubicación.
    """
    queryset = Ubicacion.objects.all()
    serializer_class = UbicacionSerializer
    permission_classes = [AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Agregar productos en esta ubicación
        productos = Producto.objects.filter(
            estado='activo',
            ubicacion=instance
        ).count()
        
        # Agregar proveedores en esta ubicación
        proveedores = ProveedorUbicacion.objects.filter(
            ubicacion=instance
        ).count()
        
        data['productos_count'] = productos
        data['proveedores_count'] = proveedores
        
        return Response(data)


class UbicacionProductosView(generics.ListAPIView):
    """
    Lista de productos disponibles en una ubicación específica.
    
    Parámetros:
    - page: Número de página
    - page_size: Elementos por página
    - categoria: Filtrar por categoría
    - precio_min: Precio mínimo
    - precio_max: Precio máximo
    """
    from apps.products.serializers import ProductoListSerializer
    from apps.products.views import ProductPagination
    
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        ubicacion_id = self.kwargs.get('ubicacion_id')
        queryset = Producto.objects.filter(
            estado='activo',
            ubicacion_id=ubicacion_id
        )
        
        # Filtrar por categoría
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        
        # Filtrar por precio
        precio_min = self.request.query_params.get('precio_min')
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        
        precio_max = self.request.query_params.get('precio_max')
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        
        return queryset


class DepartamentosListView(APIView):
    """
    Lista de departamentos únicos con conteo de productos.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        departamentos = Ubicacion.objects.values('departamento').annotate(
            total_ubicaciones=Count('id'),
            total_productos=Count('productos', filter=Q(productos__estado='activo'))
        ).order_by('departamento')
        
        return Response(departamentos)


class ProveedorUbicacionView(generics.ListCreateAPIView):
    """
    Gestionar ubicaciones del proveedor autenticado.
    
    Parámetros GET:
    - page: Número de página
    - principal_only: true/false - Solo ubicación principal
    """
    serializer_class = ProveedorUbicacionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LocationPagination
    
    def get_queryset(self):
        queryset = ProveedorUbicacion.objects.filter(proveedor=self.request.user)
        
        # Filtrar solo ubicación principal
        principal_only = self.request.query_params.get('principal_only', 'false')
        if principal_only.lower() == 'true':
            queryset = queryset.filter(es_principal=True)
        
        return queryset
    
    def perform_create(self, serializer):
        # Si es la primera ubicación o se marca como principal, actualizar otras
        if serializer.validated_data.get('es_principal', False):
            ProveedorUbicacion.objects.filter(
                proveedor=self.request.user
            ).update(es_principal=False)
        serializer.save(proveedor=self.request.user)


class ProveedorUbicacionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Actualizar o eliminar una ubicación específica del proveedor.
    """
    serializer_class = ProveedorUbicacionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProveedorUbicacion.objects.filter(proveedor=self.request.user)
    
    def perform_update(self, serializer):
        # Si se marca como principal, actualizar otras ubicaciones
        if serializer.validated_data.get('es_principal', False):
            ProveedorUbicacion.objects.filter(
                proveedor=self.request.user
            ).exclude(id=self.kwargs['pk']).update(es_principal=False)
        serializer.save()