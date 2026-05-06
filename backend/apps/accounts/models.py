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
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    empresa = models.CharField(max_length=200, blank=True, null=True, verbose_name='Nombre de empresa')
    ruc = models.CharField(max_length=20, blank=True, null=True, verbose_name='RUC')
    direccion = models.TextField(blank=True, null=True, verbose_name='Dirección')
    foto_perfil = models.ImageField(upload_to='perfiles/', blank=True, null=True, verbose_name='Foto de perfil')
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