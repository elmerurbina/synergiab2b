from rest_framework import serializers
from .models import Interaccion, Valoracion
from apps.accounts.serializers import UserSerializer


class InteraccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaccion
        fields = ('id', 'producto', 'usuario', 'tipo', 'ip', 'fecha')
        read_only_fields = ('id', 'fecha')


class ValoracionSerializer(serializers.ModelSerializer):
    usuario_info = UserSerializer(source='usuario', read_only=True)
    
    class Meta:
        model = Valoracion
        fields = ('id', 'usuario', 'usuario_info', 'producto', 'puntuacion', 'comentario', 'fecha')
        read_only_fields = ('id', 'usuario', 'fecha')