from django.db import models
from django.utils.text import slugify


class Categoria(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre de categoría')
    categoria_padre = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, 
                                       related_name='subcategorias', verbose_name='Categoría padre')
    slug = models.SlugField(unique=True, max_length=120, blank=True, verbose_name='Slug')
    descripcion = models.TextField(blank=True, null=True, verbose_name='Descripción')
    icono = models.CharField(max_length=50, blank=True, null=True, verbose_name='Icono')
    imagen = models.ImageField(upload_to='categorias/', blank=True, null=True, verbose_name='Imagen')
    orden = models.IntegerField(default=0, verbose_name='Orden')
    activo = models.BooleanField(default=True, verbose_name='Activo')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'categorias'
        ordering = ['orden', 'nombre']
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.nombre)
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.categoria_padre:
            return f"{self.categoria_padre.nombre} > {self.nombre}"
        return self.nombre
    
    @property
    def nivel(self):
        nivel = 0
        padre = self.categoria_padre
        while padre:
            nivel += 1
            padre = padre.categoria_padre
        return nivel