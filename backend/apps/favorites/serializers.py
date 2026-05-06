from rest_framework import serializers
from .models import Favorito
from apps.products.serializers import ProductoListSerializer


class FavoritoSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoListSerializer(source='producto', read_only=True)
    
    class Meta:
        model = Favorito
        fields = ('id', 'usuario', 'producto', 'producto_detalle', 'fecha')
        read_only_fields = ('id', 'fecha')