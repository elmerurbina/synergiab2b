from rest_framework import serializers
from .models import Interaccion


class InteraccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interaccion
        fields = ('id', 'producto', 'usuario', 'tipo', 'ip', 'fecha')
        read_only_fields = ('id', 'fecha')