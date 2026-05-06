from django.db import models
from apps.accounts.models import User
from apps.products.models import Producto


class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favoritos')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='favoritos')
    fecha = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'favoritos'
        unique_together = ['usuario', 'producto']
        ordering = ['-fecha']
        verbose_name = 'Favorito'
        verbose_name_plural = 'Favoritos'
    
    def __str__(self):
        return f"{self.usuario.email} - {self.producto.nombre}"