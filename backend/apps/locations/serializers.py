from rest_framework import serializers
from .models import Ubicacion, ProveedorUbicacion


class UbicacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ubicacion
        fields = ('id', 'departamento', 'municipio', 'latitud', 'longitud')
        read_only_fields = ('id',)


class ProveedorUbicacionSerializer(serializers.ModelSerializer):
    ubicacion_detalle = UbicacionSerializer(source='ubicacion', read_only=True)
    
    class Meta:
        model = ProveedorUbicacion
        fields = ('id', 'proveedor', 'ubicacion', 'ubicacion_detalle', 'es_principal', 'direccion_detallada')
        read_only_fields = ('id',)