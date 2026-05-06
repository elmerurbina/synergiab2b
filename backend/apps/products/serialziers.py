from rest_framework import serializers
from .models import Producto, ImagenProducto, Etiqueta, ProductoEtiqueta, ProductoPatrocinado
from apps.categories.serializers import CategoriaSerializer
from apps.accounts.serializers import UserSerializer


class ImagenProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenProducto
        fields = ('id', 'producto', 'url', 'es_principal', 'orden')
        read_only_fields = ('id',)


class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ('id', 'nombre', 'slug')
        read_only_fields = ('id', 'slug')


class ProductoListSerializer(serializers.ModelSerializer):
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    imagen_principal = serializers.SerializerMethodField()
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.empresa', read_only=True)
    
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'descripcion_corta', 'precio', 'precio_oferta', 
                 'precio_actual', 'categoria', 'categoria_nombre', 'proveedor', 
                 'proveedor_nombre', 'imagen_principal', 'visitas', 'ubicacion')
        read_only_fields = ('id', 'visitas')
    
    def get_imagen_principal(self, obj):
        imagen = obj.imagenes.filter(es_principal=True).first()
        if imagen:
            return self.context['request'].build_absolute_uri(imagen.url.url)
        return None


class ProductoDetailSerializer(serializers.ModelSerializer):
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    etiquetas = serializers.SerializerMethodField()
    categoria_detalle = CategoriaSerializer(source='categoria', read_only=True)
    proveedor_detalle = UserSerializer(source='proveedor', read_only=True)
    es_patrocinado = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = '__all__'
        read_only_fields = ('id', 'visitas', 'fecha_creacion', 'fecha_actualizacion')
    
    def get_etiquetas(self, obj):
        etiquetas = obj.etiquetas_rel.all()
        return EtiquetaSerializer([e.etiqueta for e in etiquetas], many=True).data
    
    def get_es_patrocinado(self, obj):
        from django.utils import timezone
        hoy = timezone.now().date()
        return obj.patrocinios.filter(activo=True, fecha_inicio__lte=hoy, fecha_fin__gte=hoy).exists()


class ProductoCreateUpdateSerializer(serializers.ModelSerializer):
    etiquetas = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    
    class Meta:
        model = Producto
        fields = ('nombre', 'descripcion', 'descripcion_corta', 'precio', 'precio_oferta',
                 'stock', 'unidad_medida', 'categoria', 'ubicacion', 'etiquetas')
    
    def create(self, validated_data):
        etiquetas = validated_data.pop('etiquetas', [])
        producto = Producto.objects.create(**validated_data)
        
        for etiqueta_nombre in etiquetas:
            etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre)
            ProductoEtiqueta.objects.create(producto=producto, etiqueta=etiqueta)
        
        return producto
    
    def update(self, instance, validated_data):
        etiquetas = validated_data.pop('etiquetas', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if etiquetas is not None:
            instance.etiquetas_rel.all().delete()
            for etiqueta_nombre in etiquetas:
                etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre)
                ProductoEtiqueta.objects.create(producto=instance, etiqueta=etiqueta)
        
        return instance


class ProductoPatrocinadoSerializer(serializers.ModelSerializer):
    producto_detalle = ProductoListSerializer(source='producto', read_only=True)
    
    class Meta:
        model = ProductoPatrocinado
        fields = ('id', 'producto', 'producto_detalle', 'fecha_inicio', 'fecha_fin', 'activo')
        read_only_fields = ('id',)