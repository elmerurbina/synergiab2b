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
    promedio_valoracion = serializers.SerializerMethodField()
    total_valoraciones = serializers.SerializerMethodField()
    proveedor_nombre = serializers.SerializerMethodField()
    proveedor_empresa = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'descripcion_corta', 'descripcion', 'precio', 'precio_oferta', 
            'precio_actual', 'categoria', 'categoria_id', 'proveedor', 'proveedor_id',
            'proveedor_nombre', 'proveedor_empresa',
            'imagen_principal', 'imagenes_list', 'visitas', 'ubicacion', 'ubicacion_id',
            'estado', 'stock', 'promedio_valoracion', 'total_valoraciones',
            'fecha_creacion', 'fecha_actualizacion'
        )
    
    def get_promedio_valoracion(self, obj):
        from django.db.models import Avg
        val = obj.valoraciones.aggregate(avg=Avg('puntuacion'))['avg']
        return round(val, 2) if val is not None else 0.0

    def get_total_valoraciones(self, obj):
        return obj.valoraciones.count()
    
    def get_precio_actual(self, obj):
        if obj.precio_oferta and obj.precio_oferta < obj.precio:
            return float(obj.precio_oferta)
        return float(obj.precio)
    
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
    
    def get_proveedor_nombre(self, obj):
        """Get provider's username or full name"""
        if obj.proveedor:
            return obj.proveedor.get_full_name() or obj.proveedor.username
        return None
    
    def get_proveedor_empresa(self, obj):
        """Get provider's company name (empresa)"""
        if obj.proveedor and obj.proveedor.empresa:
            return obj.proveedor.empresa
        return None


class ProductoDetailSerializer(serializers.ModelSerializer):
    imagenes = ImagenProductoSerializer(many=True, read_only=True)
    etiquetas = serializers.SerializerMethodField()
    categoria_info = CategoriaSerializer(source='categoria', read_only=True)
    proveedor_nombre = serializers.SerializerMethodField()
    proveedor_empresa = serializers.SerializerMethodField()
    proveedor_telefono = serializers.SerializerMethodField()
    proveedor_email = serializers.SerializerMethodField()
    proveedor_ubicacion = serializers.SerializerMethodField()
    es_patrocinado = serializers.SerializerMethodField()
    precio_actual = serializers.SerializerMethodField()
    imagen_principal = serializers.SerializerMethodField()
    promedio_valoracion = serializers.SerializerMethodField()
    total_valoraciones = serializers.SerializerMethodField()
    
    class Meta:
        model = Producto
        fields = (
            'id', 'nombre', 'descripcion', 'descripcion_corta', 'precio', 
            'precio_oferta', 'precio_actual', 'stock', 'unidad_medida', 
            'categoria', 'categoria_info', 'proveedor', 'proveedor_id',
            'proveedor_nombre', 'proveedor_empresa', 'proveedor_telefono', 
            'proveedor_email', 'proveedor_ubicacion',
            'ubicacion', 'estado', 'visitas', 'imagenes', 'etiquetas', 
            'es_patrocinado', 'imagen_principal', 'fecha_creacion', 'fecha_actualizacion',
            'promedio_valoracion', 'total_valoraciones'
        )
    
    def get_promedio_valoracion(self, obj):
        from django.db.models import Avg
        val = obj.valoraciones.aggregate(avg=Avg('puntuacion'))['avg']
        return round(val, 2) if val is not None else 0.0

    def get_total_valoraciones(self, obj):
        return obj.valoraciones.count()
    
    def get_precio_actual(self, obj):
        if obj.precio_oferta and obj.precio_oferta < obj.precio:
            return float(obj.precio_oferta)
        return float(obj.precio)
    
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
    
    def get_proveedor_nombre(self, obj):
        if obj.proveedor:
            return obj.proveedor.get_full_name() or obj.proveedor.username
        return None
    
    def get_proveedor_empresa(self, obj):
        if obj.proveedor and obj.proveedor.empresa:
            return obj.proveedor.empresa
        return None
    
    def get_proveedor_telefono(self, obj):
        if obj.proveedor:
            return obj.proveedor.telefono
        return None
    
    def get_proveedor_email(self, obj):
        if obj.proveedor:
            return obj.proveedor.email
        return None
    
    def get_proveedor_ubicacion(self, obj):
        if obj.proveedor:
            return obj.proveedor.ubicacion
        return None


class ProductoCreateUpdateSerializer(serializers.ModelSerializer):
    etiquetas = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    imagenes = serializers.ListField(child=serializers.ImageField(), write_only=True, required=False)
    
    class Meta:
        model = Producto
        fields = (
            'nombre', 'descripcion', 'descripcion_corta', 'precio', 'precio_oferta',
            'stock', 'unidad_medida', 'categoria', 'ubicacion', 'etiquetas', 'imagenes'
        )
    
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
    
    def validate_imagenes(self, value):
        if value and len(value) > 10:
            raise serializers.ValidationError("Máximo 10 imágenes por producto")
        return value
    
    def create(self, validated_data):
        etiquetas = validated_data.pop('etiquetas', [])
        imagenes = validated_data.pop('imagenes', [])
        
        producto = Producto.objects.create(**validated_data)
        
        # Create etiquetas
        for etiqueta_nombre in etiquetas:
            etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre.lower())
            ProductoEtiqueta.objects.create(producto=producto, etiqueta=etiqueta)
        
        # Create images
        for index, imagen in enumerate(imagenes):
            ImagenProducto.objects.create(
                producto=producto,
                url=imagen,
                es_principal=(index == 0),
                orden=index
            )
        
        return producto
    
    def update(self, instance, validated_data):
        etiquetas = validated_data.pop('etiquetas', None)
        imagenes = validated_data.pop('imagenes', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if etiquetas is not None:
            instance.etiquetas_rel.all().delete()
            for etiqueta_nombre in etiquetas:
                etiqueta, _ = Etiqueta.objects.get_or_create(nombre=etiqueta_nombre.lower())
                ProductoEtiqueta.objects.create(producto=instance, etiqueta=etiqueta)
        
        if imagenes is not None:
            for index, imagen in enumerate(imagenes):
                ImagenProducto.objects.create(
                    producto=instance,
                    url=imagen,
                    es_principal=(index == 0 and not instance.imagenes.exists()),
                    orden=index
                )
        
        return instance


class ProductoPatrocinadoSerializer(serializers.ModelSerializer):
    producto_info = ProductoListSerializer(source='producto', read_only=True)
    
    class Meta:
        model = ProductoPatrocinado
        fields = ('id', 'producto', 'producto_info', 'fecha_inicio', 'fecha_fin', 'activo')
        read_only_fields = ('id',)