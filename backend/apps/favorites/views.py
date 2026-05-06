from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from .models import Favorito
from .serializers import FavoritoSerializer
from apps.products.models import Producto


class FavoritePagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class FavoritoListView(generics.ListAPIView):
    """
    Lista de productos favoritos del usuario autenticado.
    
    Parámetros de consulta:
    - page: Número de página
    - page_size: Elementos por página
    - search: Buscar en productos favoritos
    - categoria: Filtrar por categoría
    - ordering: Ordenar por fecha (-fecha, fecha)
    """
    serializer_class = FavoritoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = FavoritePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['producto__nombre', 'producto__descripcion']
    ordering_fields = ['fecha']
    
    def get_queryset(self):
        queryset = Favorito.objects.filter(usuario=self.request.user)
        
        # Filtrar por categoría
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(producto__categoria_id=categoria)
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-fecha')
        if ordering in ['fecha', '-fecha']:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'count': queryset.count(),
                'results': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })


class FavoritoCreateView(APIView):
    """
    Agregar un producto a favoritos.
    
    Body:
    {
        "producto_id": 1
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        producto_id = request.data.get('producto_id')
        
        if not producto_id:
            return Response(
                {'error': 'producto_id es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        producto = get_object_or_404(Producto, id=producto_id, estado='activo')
        
        favorito, created = Favorito.objects.get_or_create(
            usuario=request.user,
            producto=producto
        )
        
        if created:
            serializer = FavoritoSerializer(favorito, context={'request': request})
            return Response({
                'message': 'Producto agregado a favoritos',
                'favorito': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'El producto ya está en favoritos'
        }, status=status.HTTP_200_OK)


class FavoritoDeleteView(APIView):
    """
    Eliminar un producto de favoritos.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, producto_id):
        favorito = Favorito.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).first()
        
        if favorito:
            favorito.delete()
            return Response({
                'message': 'Producto eliminado de favoritos'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Producto no encontrado en favoritos'
        }, status=status.HTTP_404_NOT_FOUND)


class FavoritoCheckView(APIView):
    """
    Verificar si un producto está en favoritos.
    
    Parámetros:
    - producto_id: ID del producto a verificar
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        producto_id = request.query_params.get('producto_id')
        
        if not producto_id:
            return Response(
                {'error': 'producto_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        es_favorito = Favorito.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).exists()
        
        return Response({
            'producto_id': int(producto_id),
            'es_favorito': es_favorito
        })


class FavoritoCountView(APIView):
    """
    Obtener el número total de favoritos del usuario.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        count = Favorito.objects.filter(usuario=request.user).count()
        return Response({'total_favoritos': count})