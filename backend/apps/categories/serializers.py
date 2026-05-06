from rest_framework import serializers
from .models import Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    subcategorias = serializers.SerializerMethodField()
    
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'slug', 'descripcion', 'imagen', 'activo', 'categoria_padre', 'subcategorias']
        read_only_fields = ['slug']
    
    def get_subcategorias(self, obj):
        if obj.categoria_padre is None:
            subcategorias = obj.subcategorias.filter(activo=True)
            return CategoriaSerializer(subcategorias, many=True).data
        return []