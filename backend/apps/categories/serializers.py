from rest_framework import serializers
from .models import Categoria


class SubcategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'slug', 'icono', 'orden')


class CategoriaSerializer(serializers.ModelSerializer):
    subcategorias = SubcategoriaSerializer(many=True, read_only=True)
    nivel = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Categoria
        fields = ('id', 'nombre', 'categoria_padre', 'slug', 'descripcion', 'icono', 
                 'imagen', 'orden', 'activo', 'nivel', 'subcategorias', 'fecha_creacion')
        read_only_fields = ('id', 'slug', 'fecha_creacion')