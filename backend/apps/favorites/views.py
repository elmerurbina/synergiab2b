from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Favorito
from .serializers import FavoritoSerializer
from apps.products.models import Producto


class FavoritoListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoritoSerializer
    
    def get_queryset(self):
        return Favorito.objects.filter(usuario=self.request.user)


class FavoritoCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        producto_id = request.data.get('producto_id')
        if not producto_id:
            return Response({'error': 'producto_id es requerido'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        producto = get_object_or_404(Producto, id=producto_id)
        favorito, created = Favorito.objects.get_or_create(
            usuario=request.user,
            producto=producto
        )
        
        if created:
            serializer = FavoritoSerializer(favorito)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response({'message': 'Producto ya está en favoritos'}, 
                       status=status.HTTP_200_OK)


class FavoritoDeleteView(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, producto_id):
        favorito = Favorito.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).first()
        
        if favorito:
            favorito.delete()
            return Response({'message': 'Producto eliminado de favoritos'})
        return Response({'error': 'Producto no encontrado en favoritos'}, 
                       status=status.HTTP_404_NOT_FOUND)