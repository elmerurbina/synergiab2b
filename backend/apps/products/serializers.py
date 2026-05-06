from rest_framework import serializers
from .models import Producto, ImagenProducto, Etiqueta, ProductoEtiqueta, ProductoPatrocinado
from apps.categories.serializers import CategoriaSerializer
from apps.accounts.serializers import UserSerializer


class ImagenProductoSerializer(serializers.ModelSerializer):
    url_absoluta = serializers.SerializerMethodField()
    
    class Meta:
        model = ImagenProducto
        fields = ('id', 'producto', 'url', 'url_absoluta', 'es_principal', 'orden')
        read_only_fields = ('id',)
    
    def get_url_absoluta(self, obj):
        if obj.url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.url.url)
            return obj.url.url
        return None


class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ('id', 'nombre', 'slug')
        read_only_fields = ('id', 'slug')


class ProductoListSerializer(serializers.ModelSerializer):
    precio_actual = serializers.SerializerMethodField()
    imagen_principal = serializers.SerializerMethodField()
    imagenes_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'descripcion_corta', 'precio', 'precio_oferta', 
                 'precio_actual', 'categoria_id', 'proveedor_id', 'imagen_principal', 
                 'imagenes_list', 'visitas', 'ubicacion_id', 'estado', 'stock')
    
    def get_precio_actual(self, obj):
        if obj.precio_oferta and obj.precio_oferta < obj.precio:
            return obj.precio_oferta
        return obj.precio
    
    def get_imagen_principal(self, obj):
        # Try to get image marked as principal first
        imagen = obj.imagenes.filter(es_principal=True).first()
        
        # If no principal image, get the first image
        if not imagen:
            imagen = obj.imagenes.first()
        
        if imagen and imagen.url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(imagen.url.url)
            return imagen.url.url
        return None
    
    def get_imagenes_list(self, obj):
        request = self.context.get('request')
        imagenes = []
        for img in obj.imagenes.all():
            if img.url:
                if request:
                    url = request.build_absolute_uri(img.url.url)
                else:
                    url = img.url.url
                imagenes.append({
                    'id': img.id,
                    'url': url,
                    'es_principal': img.es_principal
                })
        return imagenes


class ProductoDetailSerializer(serializers.ModelSerializer):
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    etiquetas = serializers.SerializerMethodField()
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    proveedor_info = UserSerializer(source='proveedor', read_only=True)
    es_patrocinado = serializers.SerializerMethodField()
    precio_actual = serializers.SerializerMethodField()
    imagen_principal = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = ('id', 'nombre', 'descripcion', 'descripcion_corta', 'precio', 
                 'precio_oferta', 'precio_actual', 'stock', 'unidad_medida', 
                 'categoria', 'categoria_info', 'proveedor', 'proveedor_info',
                 'ubicacion', 'estado', 'visitas', 'imagenes', 'etiquetas', 
                 'es_patrocinado', 'imagen_principal', 'fecha_creacion', 'fecha_actualizacion')
    
    def get_precio_actual(self, obj):
        if obj.precio_oferta and obj.precio_oferta < obj.precio:
            return obj.precio_oferta
        return obj.precio
    
    def get_imagen_principal(self, obj):
        imagen = obj.imagenes.filter(es_principal=True).first()
        if not imagen:
            imagen = obj.imagenes.first()
        
        if imagen and imagen.url:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(imagen.url.url)
            return imagen.url.url
        return None
    
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
    
    def validate_descripcion_corta(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("La descripción corta es requerida")
        if len(value) < 10:
            raise serializers.ValidationError("La descripción corta debe tener al menos 10 caracteres")
        if len(value) > 200:
            raise serializers.ValidationError("La descripción corta debe tener menos de 200 caracteres")
        return value
    
    def validate_descripcion(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("La descripción es requerida")
        if len(value) < 20:
            raise serializers.ValidationError("La descripción debe tener al menos 20 caracteres")
        return value
    
    def create(self, validated_data):
        etiquetas = validated_data.pop('etiquetas', [])
        producto = Producto.objects.create(**validated_data)
        
        for etiqueta_nombre in etiquetas:
            etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre.lower())
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
                etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre.lower())
                ProductoEtiqueta.objects.create(producto=instance, etiqueta=etiqueta)
        
        return instance


class ProductoPatrocinadoSerializer(serializers.ModelSerializer):
    producto_info = ProductoListSerializer(source='producto', read_only=True)
    
    class Meta:
        model = ProductoPatrocinado
        fields = ('id', 'producto', 'producto_info', 'fecha_inicio', 'fecha_fin', 'activo')
        read_only_fields = ('id',)