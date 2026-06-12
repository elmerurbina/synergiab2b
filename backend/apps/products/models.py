from django.db import models
from apps.accounts.models import User
from apps.categories.models import Categoria
from apps.locations.models import Ubicacion


class Producto(models.Model):
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('pendiente', 'Pendiente'),
    ]
    
    proveedor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='productos', limit_choices_to={'rol': 'proveedor'})
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='productos')
    nombre = models.CharField(max_length=200, verbose_name='Nombre del producto')
    descripcion = models.TextField(verbose_name='Descripción')
    descripcion_corta = models.CharField(max_length=300, blank=True, null=True)
    precio = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='Precio')
    precio_oferta = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0, verbose_name='Stock')
    unidad_medida = models.CharField(max_length=50, default='unidad', verbose_name='Unidad de medida')
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.SET_NULL, null=True, related_name='productos')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activo')
    visitas = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'productos'
        ordering = ['-fecha_creacion']
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
    
    def __str__(self):
        return f"{self.nombre} - {self.proveedor.empresa}"
    
    @property
    def precio_actual(self):
        if self.precio_oferta and self.precio_oferta < self.precio:
            return self.precio_oferta
        return self.precio


class ImagenProducto(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='imagenes')
    url = models.ImageField(upload_to='productos/', verbose_name='URL de la imagen')
    es_principal = models.BooleanField(default=False, verbose_name='Imagen principal')
    orden = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'imagenes_producto'
        ordering = ['orden']
        verbose_name = 'Imagen de producto'
        verbose_name_plural = 'Imágenes de producto'
    
    def __str__(self):
        return f"Imagen de {self.producto.nombre}"


class Etiqueta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    
    class Meta:
        db_table = 'etiquetas'
        ordering = ['nombre']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.nombre


class ProductoEtiqueta(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='etiquetas_rel')
    etiqueta = models.ForeignKey(Etiqueta, on_delete=models.CASCADE, related_name='productos_rel')
    
    class Meta:
        db_table = 'producto_etiquetas'
        unique_together = ['producto', 'etiqueta']


class ProductoPatrocinado(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='patrocinios')
    fecha_inicio = models.DateField(verbose_name='Fecha de inicio')
    fecha_fin = models.DateField(verbose_name='Fecha de fin')
    activo = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'productos_patrocinados'
        verbose_name = 'Producto patrocinado'
        verbose_name_plural = 'Productos patrocinados'
    
    def __str__(self):
        return f"{self.producto.nombre} - {self.fecha_inicio} a {self.fecha_fin}"