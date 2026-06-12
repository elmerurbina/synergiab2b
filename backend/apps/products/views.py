from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from django.db.models import Q, Count, F
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Producto, ImagenProducto, Etiqueta, ProductoPatrocinado
from .serializers import (
    ProductoListSerializer, ProductoDetailSerializer, 
    ProductoCreateUpdateSerializer, ImagenProductoSerializer,
    EtiquetaSerializer, ProductoPatrocinadoSerializer
)
from apps.interactions.models import Interaccion


class ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class ProductoListView(generics.ListAPIView):
    """
    Lista de productos con filtros avanzados.
    
    Parámetros de consulta:
    - page: Número de página
    - page_size: Elementos por página (máx 100)
    - search: Búsqueda por nombre, descripción o empresa
    - categoria: ID de categoría
    - categoria__slug: Slug de categoría
    - precio_min: Precio mínimo
    - precio_max: Precio máximo
    - ubicacion: ID de ubicación
    - proveedor: ID de proveedor
    - ordering: Ordenar por campo (precio, -precio, fecha_creacion, -fecha_creacion, visitas)
    - en_oferta: true/false - Solo productos en oferta
    - con_stock: true/false - Solo productos con stock
    """
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'proveedor__empresa', 'proveedor__username']
    ordering_fields = ['precio', 'fecha_creacion', 'visitas']
    
    def get_queryset(self):
        queryset = Producto.objects.filter(estado='activo')
        
        # Filter by category
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        
        categoria_slug = self.request.query_params.get('categoria__slug')
        if categoria_slug:
            queryset = queryset.filter(categoria__slug=categoria_slug)
        
        # Filter by price range
        precio_min = self.request.query_params.get('precio_min')
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
        
        precio_max = self.request.query_params.get('precio_max')
        if precio_max:
            queryset = queryset.filter(precio__lte=precio_max)
        
        # Filter by location
        ubicacion = self.request.query_params.get('ubicacion')
        if ubicacion:
            queryset = queryset.filter(ubicacion_id=ubicacion)
        
        # Filter by proveedor
        proveedor = self.request.query_params.get('proveedor')
        if proveedor:
            queryset = queryset.filter(proveedor_id=proveedor)
        
        # Filter on sale
        en_oferta = self.request.query_params.get('en_oferta')
        if en_oferta and en_oferta.lower() == 'true':
            queryset = queryset.filter(precio_oferta__isnull=False)
            queryset = queryset.filter(precio_oferta__lt=F('precio'))
        
        # Filter with stock
        con_stock = self.request.query_params.get('con_stock')
        if con_stock and con_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(nombre__icontains=search) |
                Q(descripcion__icontains=search) |
                Q(etiquetas_rel__etiqueta__nombre__icontains=search)
            ).distinct()
        
        # Ordering
        ordering = self.request.query_params.get('ordering', '-fecha_creacion')
        # Validate ordering field to prevent SQL injection
        allowed_orderings = ['precio', '-precio', 'fecha_creacion', '-fecha_creacion', 'visitas', '-visitas']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-fecha_creacion')
        
        return queryset


class ProductoDetailView(generics.RetrieveAPIView):
    """
    Detalle completo de un producto por ID.
    Incrementa el contador de visitas y registra la interacción.
    """
    queryset = Producto.objects.filter(estado='activo')
    serializer_class = ProductoDetailSerializer
    permission_classes = [AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment visits
        instance.visitas += 1
        instance.save()
        
        # Register interaction
        Interaccion.objects.create(
            producto=instance,
            usuario=request.user if request.user.is_authenticated else None,
            tipo='vista',
            ip=self.get_client_ip(request)
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ProductoCreateView(generics.CreateAPIView):
    """
    Crear un nuevo producto con imágenes (Solo para proveedores autenticados)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoCreateUpdateSerializer
    parser_classes = (MultiPartParser, FormParser)  # Important for file uploads
    
    def perform_create(self, serializer):
        # Verificar que el usuario sea proveedor
        if self.request.user.rol != 'proveedor':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Solo los proveedores pueden crear productos")
        
        # Save product with images
        serializer.save(proveedor=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Log received data for debugging
        print("📸 Files received:", request.FILES.keys())
        print("📝 Data received:", request.data.keys())
        
        return super().create(request, *args, **kwargs)


class ProductoUpdateView(generics.UpdateAPIView):
    """
    Actualizar un producto existente (Solo el propietario)
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoCreateUpdateSerializer
    parser_classes = (MultiPartParser, FormParser)  # Allow file uploads
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)


class ProductoDeleteView(generics.DestroyAPIView):
    """
    Eliminar (desactivar) un producto (Solo el propietario)
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            print(f"🗑️ Deleting product: {instance.id} - {instance.nombre}")
            
            instance.delete()
            
            return Response({
                'message': 'Producto eliminado exitosamente',
                'id': instance.id
            }, status=status.HTTP_200_OK)
            
        except Producto.DoesNotExist:
            return Response({
                'error': 'Producto no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"❌ Error deleting product: {str(e)}")
            return Response({
                'error': 'Error al eliminar el producto'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProductoPatrocinadoListView(generics.ListAPIView):
    """
    Lista de productos patrocinados activos
    """
    serializer_class = ProductoPatrocinadoSerializer
    permission_classes = [AllowAny]
    pagination_class = ProductPagination
    
    def get_queryset(self):
        hoy = timezone.now().date()
        return ProductoPatrocinado.objects.filter(
            activo=True, 
            fecha_inicio__lte=hoy, 
            fecha_fin__gte=hoy
        ).select_related('producto')[:10]


class ImagenProductoView(APIView):
    """
    Subir o eliminar imágenes de productos
    """
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) 
    
    def post(self, request):
        print("📸 ImagenProductoView - Files:", request.FILES)
        print("📝 ImagenProductoView - Data:", request.data)
        
        serializer = ImagenProductoSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            producto = serializer.validated_data['producto']
            if producto.proveedor != request.user:
                return Response({'error': 'No autorizado'}, 
                              status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("❌ Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        try:
            imagen = ImagenProducto.objects.get(pk=pk)
            if imagen.producto.proveedor != request.user:
                return Response({'error': 'No autorizado'}, 
                              status=status.HTTP_403_FORBIDDEN)
            imagen.delete()
            return Response({'message': 'Imagen eliminada'})
        except ImagenProducto.DoesNotExist:
            return Response({'error': 'Imagen no encontrada'}, 
                          status=status.HTTP_404_NOT_FOUND)


class EtiquetaListView(generics.ListAPIView):
    """
    Lista de todas las etiquetas disponibles
    """
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']


class ProductoProveedorView(generics.ListAPIView):
    """
    Lista de productos del proveedor autenticado
    """
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)


class ProductoFiltrosView(APIView):
    """
    Obtener opciones de filtros disponibles
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        # Precios mínimos y máximos
        precios = Producto.objects.filter(estado='activo').aggregate(
            min_precio=models.Min('precio'),
            max_precio=models.Max('precio')
        )
        
        # Categorías con conteo
        categorias = Producto.objects.filter(estado='activo').values(
            'categoria__id', 'categoria__nombre', 'categoria__slug'
        ).annotate(total=models.Count('id')).order_by('-total')
        
        # Ubicaciones con conteo
        ubicaciones = Producto.objects.filter(estado='activo').values(
            'ubicacion__id', 'ubicacion__departamento', 'ubicacion__municipio'
        ).annotate(total=models.Count('id')).order_by('-total')
        
        return Response({
            'precios': {
                'minimo': precios['min_precio'] or 0,
                'maximo': precios['max_precio'] or 0
            },
            'categorias': list(categorias),
            'ubicaciones': list(ubicaciones)
        })