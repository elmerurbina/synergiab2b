from django.db import models
from apps.accounts.models import User


class Ubicacion(models.Model):
    departamento = models.CharField(max_length=100, verbose_name='Departamento')
    municipio = models.CharField(max_length=100, verbose_name='Municipio')
    latitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitud = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    
    class Meta:
        db_table = 'ubicaciones'
        unique_together = ['departamento', 'municipio']
        ordering = ['departamento', 'municipio']
        verbose_name = 'Ubicación'
        verbose_name_plural = 'Ubicaciones'
    
    def __str__(self):
        return f"{self.municipio}, {self.departamento}"


class ProveedorUbicacion(models.Model):
    proveedor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ubicaciones', limit_choices_to={'rol': 'proveedor'})
    ubicacion = models.ForeignKey(Ubicacion, on_delete=models.CASCADE, related_name='proveedores')
    es_principal = models.BooleanField(default=False, verbose_name='Ubicación principal')
    direccion_detallada = models.TextField(blank=True, null=True, verbose_name='Dirección detallada')
    
    class Meta:
        db_table = 'proveedor_ubicaciones'
        verbose_name = 'Ubicación de proveedor'
        verbose_name_plural = 'Ubicaciones de proveedores'
        unique_together = ['proveedor', 'ubicacion']
    
    def __str__(self):
        return f"{self.proveedor.empresa} - {self.ubicacion}"