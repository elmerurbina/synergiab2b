from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.db.models import Q, Count
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
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


class ProductoListView(generics.ListAPIView):
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'proveedor__empresa']
    ordering_fields = ['precio', 'fecha_creacion', 'visitas']
    
    def get_queryset(self):
        queryset = Producto.objects.filter(estado='activo')
        
        # Filter by category
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(categoria_id=categoria)
        
        # Filter by price range
        precio_min = self.request.query_params.get('precio_min')
        precio_max = self.request.query_params.get('precio_max')
        if precio_min:
            queryset = queryset.filter(precio__gte=precio_min)
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
        queryset = queryset.order_by(ordering)
        
        return queryset


class ProductoDetailView(generics.RetrieveAPIView):
    queryset = Producto.objects.filter(estado='activo')
    serializer_class = ProductoDetailSerializer
    
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
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoCreateUpdateSerializer
    
    def perform_create(self, serializer):
        serializer.save(proveedor=self.request.user)


class ProductoUpdateView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoCreateUpdateSerializer
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)


class ProductoDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)
    
    def perform_destroy(self, instance):
        instance.estado = 'inactivo'
        instance.save()


class ProductoPatrocinadoListView(generics.ListAPIView):
    serializer_class = ProductoPatrocinadoSerializer
    
    def get_queryset(self):
        hoy = timezone.now().date()
        return ProductoPatrocinado.objects.filter(
            activo=True, 
            fecha_inicio__lte=hoy, 
            fecha_fin__gte=hoy
        ).select_related('producto')[:10]


class ImagenProductoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ImagenProductoSerializer(data=request.data)
        if serializer.is_valid():
            producto = serializer.validated_data['producto']
            if producto.proveedor != request.user:
                return Response({'error': 'No autorizado'}, 
                              status=status.HTTP_403_FORBIDDEN)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre']


class ProductoProveedorView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductoListSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        return Producto.objects.filter(proveedor=self.request.user)