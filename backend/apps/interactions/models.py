from django.db import models
from apps.accounts.models import User
from apps.products.models import Producto


class Interaccion(models.Model):
    TIPO_CHOICES = [
        ('vista', 'Vista'),
        ('click_whatsapp', 'Click en WhatsApp'),
        ('compartir', 'Compartir'),
        ('contacto', 'Contacto'),
    ]
    
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='interacciones')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='interacciones')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'interacciones'
        ordering = ['-fecha']
        verbose_name = 'Interacción'
        verbose_name_plural = 'Interacciones'
        indexes = [
            models.Index(fields=['producto', 'tipo']),
            models.Index(fields=['-fecha']),
        ]
    
    def __str__(self):
        return f"{self.producto.nombre} - {self.tipo} - {self.fecha}"


class Valoracion(models.Model):
    from django.core.validators import MinValueValidator, MaxValueValidator
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='valoraciones')
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='valoraciones')
    puntuacion = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='Puntuación'
    )
    comentario = models.TextField(blank=True, null=True, verbose_name='Comentario')
    fecha = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de valoración')

    class Meta:
        db_table = 'valoraciones'
        ordering = ['-fecha']
        unique_together = ('usuario', 'producto')
        verbose_name = 'Valoración'
        verbose_name_plural = 'Valoraciones'

    def __str__(self):
        return f"{self.usuario.email} - {self.producto.nombre} - {self.puntuacion}"