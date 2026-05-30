# apps/accounts/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('proveedor', 'Proveedor'),
        ('comprador', 'Comprador'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='Correo electrónico')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='comprador', verbose_name='Rol')
    estado = models.BooleanField(default=True, verbose_name='Estado activo')
    
    # Contact Information
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    
    # Business Information (for proveedores)
    empresa = models.CharField(max_length=200, blank=True, null=True, verbose_name='Nombre de empresa')
    ruc = models.CharField(max_length=20, blank=True, null=True, verbose_name='RUC')
    direccion = models.TextField(blank=True, null=True, verbose_name='Dirección')
    
    # Profile Customization Fields (New)
    ubicacion = models.CharField(max_length=200, blank=True, null=True, verbose_name='Ubicación/Ciudad')
    sitio_web = models.URLField(blank=True, null=True, verbose_name='Sitio web')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción de la empresa')
    
    # Profile Image
    foto_perfil = models.ImageField(upload_to='perfiles/', blank=True, null=True, verbose_name='Foto de perfil')
    
    # Timestamps
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    fecha_actualizacion = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.email} - {self.get_rol_display()}"
    
    @property
    def profile_image(self):
        """Property to access profile image URL (compatibility with frontend)"""
        if self.foto_perfil:
            return self.foto_perfil.url
        return None
    
    @property
    def full_name(self):
        """Get user's full name or business name"""
        if self.empresa:
            return self.empresa
        return self.get_full_name() or self.username
    
    def get_stats(self):
        """Get user statistics based on role"""
        from apps.products.models import Producto
        from apps.favorites.models import Favorito
        from apps.interactions.models import Interaccion
        
        if self.rol == 'proveedor':
            productos = Producto.objects.filter(proveedor=self)
            return {
                'total_productos': productos.count(),
                'productos_activos': productos.filter(estado='activo').count(),
                'total_visitas': productos.aggregate(total=models.Sum('visitas'))['total'] or 0,
                'total_interacciones': Interaccion.objects.filter(producto__proveedor=self).count()
            }
        elif self.rol == 'comprador':
            return {
                'total_favoritos': Favorito.objects.filter(usuario=self).count()
            }
        return {}