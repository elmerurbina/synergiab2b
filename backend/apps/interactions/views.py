from rest_framework import generics, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from .models import Interaccion
from .serializers import InteraccionSerializer
from apps.products.models import Producto


class InteraccionCreateView(APIView):
    """
    Registrar una interacción (vista, click WhatsApp, compartir, contacto).
    
    Body:
    {
        "producto_id": 1,
        "tipo": "vista" | "click_whatsapp" | "compartir" | "contacto"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        producto_id = request.data.get('producto_id')
        tipo = request.data.get('tipo')
        
        if not producto_id or not tipo:
            return Response({
                'error': 'producto_id y tipo son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        tipos_validos = ['vista', 'click_whatsapp', 'compartir', 'contacto']
        if tipo not in tipos_validos:
            return Response({
                'error': f'tipo debe ser uno de: {", ".join(tipos_validos)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        producto = Producto.objects.filter(id=producto_id, estado='activo').first()
        if not producto:
            return Response({
                'error': 'Producto no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Crear interacción
        interaccion = Interaccion.objects.create(
            producto=producto,
            usuario=request.user if request.user.is_authenticated else None,
            tipo=tipo,
            ip=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Si es click en WhatsApp, incrementar contador en el producto
        if tipo == 'click_whatsapp':
            producto.visitas += 1
            producto.save()
        
        serializer = InteraccionSerializer(interaccion)
        return Response({
            'message': 'Interacción registrada',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class EstadisticasView(APIView):
    """
    Estadísticas generales de interacciones (Solo administradores).
    
    Parámetros:
    - periodo: dia, semana, mes, año
    - producto_id: Filtrar por producto específico
    - proveedor_id: Filtrar por proveedor
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        hoy = timezone.now()
        periodo = request.query_params.get('periodo', 'mes')
        producto_id = request.query_params.get('producto_id')
        proveedor_id = request.query_params.get('proveedor_id')
        
        # Definir rangos de tiempo
        rangos = {
            'dia': hoy - timedelta(days=1),
            'semana': hoy - timedelta(days=7),
            'mes': hoy - timedelta(days=30),
            'año': hoy - timedelta(days=365)
        }
        
        fecha_inicio = rangos.get(periodo, rangos['mes'])
        
        # Base de consulta
        queryset = Interaccion.objects.filter(fecha__gte=fecha_inicio)
        
        # Filtrar por producto
        if producto_id:
            queryset = queryset.filter(producto_id=producto_id)
        
        # Filtrar por proveedor
        if proveedor_id:
            queryset = queryset.filter(producto__proveedor_id=proveedor_id)
        
        # Estadísticas generales
        total_interacciones = queryset.count()
        total_vistas = queryset.filter(tipo='vista').count()
        total_clicks = queryset.filter(tipo='click_whatsapp').count()
        total_compartidos = queryset.filter(tipo='compartir').count()
        total_contactos = queryset.filter(tipo='contacto').count()
        
        # Estadísticas por tipo
        stats_por_tipo = queryset.values('tipo').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Productos más populares
        productos_populares = Producto.objects.filter(
            id__in=queryset.values_list('producto_id', flat=True).distinct()
        ).annotate(
            total_interacciones=Count('interacciones', filter=Q(interacciones__fecha__gte=fecha_inicio)),
            total_vistas=Count('interacciones', filter=Q(interacciones__tipo='vista', interacciones__fecha__gte=fecha_inicio)),
            total_clicks=Count('interacciones', filter=Q(interacciones__tipo='click_whatsapp', interacciones__fecha__gte=fecha_inicio))
        ).order_by('-total_interacciones')[:10]
        
        from apps.products.serializers import ProductoListSerializer
        productos_data = ProductoListSerializer(productos_populares, many=True, context={'request': request}).data
        
        # Estadísticas por día (últimos 30 días)
        ultimos_30_dias = []
        for i in range(30):
            dia = hoy - timedelta(days=i)
            dia_inicio = dia.replace(hour=0, minute=0, second=0, microsecond=0)
            dia_fin = dia.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            count = Interaccion.objects.filter(
                fecha__gte=dia_inicio,
                fecha__lte=dia_fin
            ).count()
            
            ultimos_30_dias.append({
                'fecha': dia.date(),
                'interacciones': count
            })
        
        return Response({
            'periodo': periodo,
            'fecha_inicio': fecha_inicio,
            'total': {
                'interacciones': total_interacciones,
                'vistas': total_vistas,
                'clicks_whatsapp': total_clicks,
                'compartidos': total_compartidos,
                'contactos': total_contactos
            },
            'por_tipo': list(stats_por_tipo),
            'productos_populares': productos_data,
            'tendencia_30_dias': ultimos_30_dias[::-1]  # Orden cronológico
        })


class ProductoEstadisticasView(APIView):
    """
    Estadísticas de interacciones para un producto específico.
    (Solo el propietario del producto o administrador)
    
    Parámetros:
    - periodo: dia, semana, mes, año
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, producto_id):
        producto = Producto.objects.filter(id=producto_id).first()
        
        if not producto:
            return Response({
                'error': 'Producto no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Verificar permisos
        if producto.proveedor != request.user and not request.user.is_superuser:
            return Response({
                'error': 'No autorizado para ver estadísticas de este producto'
            }, status=status.HTTP_403_FORBIDDEN)
        
        periodo = request.query_params.get('periodo', 'mes')
        hoy = timezone.now()
        
        rangos = {
            'dia': hoy - timedelta(days=1),
            'semana': hoy - timedelta(days=7),
            'mes': hoy - timedelta(days=30),
            'año': hoy - timedelta(days=365)
        }
        
        fecha_inicio = rangos.get(periodo, rangos['mes'])
        
        interacciones = Interaccion.objects.filter(
            producto=producto,
            fecha__gte=fecha_inicio
        )
        
        stats_por_tipo = interacciones.values('tipo').annotate(
            count=Count('id')
        )
        
        # Tendencias por día
        tendencia = []
        for i in range(30):
            dia = hoy - timedelta(days=i)
            dia_inicio = dia.replace(hour=0, minute=0, second=0, microsecond=0)
            dia_fin = dia.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            count = interacciones.filter(
                fecha__gte=dia_inicio,
                fecha__lte=dia_fin
            ).count()
            
            tendencia.append({
                'fecha': dia.date(),
                'interacciones': count
            })
        
        return Response({
            'producto_id': producto_id,
            'producto_nombre': producto.nombre,
            'periodo': periodo,
            'estadisticas': list(stats_por_tipo),
            'total_interacciones': interacciones.count(),
            'tendencia_30_dias': tendencia[::-1]
        })


class ProveedorEstadisticasView(APIView):
    """
    Estadísticas de interacciones para todos los productos del proveedor.
    (Solo para proveedores autenticados)
    
    Parámetros:
    - periodo: dia, semana, mes, año
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Verificar que sea proveedor
        if request.user.rol != 'proveedor' and not request.user.is_superuser:
            return Response({
                'error': 'Solo los proveedores pueden ver estas estadísticas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        periodo = request.query_params.get('periodo', 'mes')
        hoy = timezone.now()
        
        rangos = {
            'dia': hoy - timedelta(days=1),
            'semana': hoy - timedelta(days=7),
            'mes': hoy - timedelta(days=30),
            'año': hoy - timedelta(days=365)
        }
        
        fecha_inicio = rangos.get(periodo, rangos['mes'])
        
        productos = Producto.objects.filter(proveedor=request.user)
        
        interacciones = Interaccion.objects.filter(
            producto__in=productos,
            fecha__gte=fecha_inicio
        )
        
        # Estadísticas por producto
        stats_por_producto = interacciones.values(
            'producto__id', 'producto__nombre'
        ).annotate(
            total=Count('id'),
            vistas=Count('id', filter=Q(tipo='vista')),
            clicks=Count('id', filter=Q(tipo='click_whatsapp')),
            compartidos=Count('id', filter=Q(tipo='compartir')),
            contactos=Count('id', filter=Q(tipo='contacto'))
        ).order_by('-total')
        
        # Tendencias por día para los productos del proveedor (últimos 7 o 30 días)
        days_map = {
            'dia': 7,
            'semana': 7,
            'mes': 30,
            'año': 30
        }
        days_to_calculate = days_map.get(periodo, 30)
        
        tendencia_diaria = []
        for i in range(days_to_calculate):
            dia = hoy - timedelta(days=i)
            dia_inicio = dia.replace(hour=0, minute=0, second=0, microsecond=0)
            dia_fin = dia.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            dia_interacciones = interacciones.filter(
                fecha__gte=dia_inicio,
                fecha__lte=dia_fin
            )
            
            vistas = dia_interacciones.filter(tipo='vista').count()
            clicks = dia_interacciones.filter(tipo='click_whatsapp').count()
            contactos = dia_interacciones.filter(tipo='contacto').count()
            
            tendencia_diaria.append({
                'fecha': dia.strftime('%Y-%m-%d'),
                'vistas': vistas,
                'clicks_whatsapp': clicks,
                'contactos': contactos,
                'total': dia_interacciones.count()
            })
            
        return Response({
            'periodo': periodo,
            'total_productos': productos.count(),
            'total_interacciones': interacciones.count(),
            'por_producto': list(stats_por_producto),
            'tendencia_diaria': tendencia_diaria[::-1]
        })


class TopProductosView(APIView):
    """
    Top productos más vistos o con más interacciones.
    
    Parámetros:
    - tipo: vistas, clicks, interacciones (default: vistas)
    - limite: Número de resultados (default: 10, max: 50)
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        tipo = request.query_params.get('tipo', 'vistas')
        limite = min(int(request.query_params.get('limite', 10)), 50)
        
        if tipo == 'vistas':
            queryset = Producto.objects.filter(estado='activo').order_by('-visitas')[:limite]
        elif tipo == 'clicks':
            queryset = Producto.objects.filter(estado='activo').annotate(
                total_clicks=Count('interacciones', filter=Q(interacciones__tipo='click_whatsapp'))
            ).order_by('-total_clicks')[:limite]
        else:  # interacciones totales
            queryset = Producto.objects.filter(estado='activo').annotate(
                total_interacciones=Count('interacciones')
            ).order_by('-total_interacciones')[:limite]
        
        from apps.products.serializers import ProductoListSerializer
        serializer = ProductoListSerializer(queryset, many=True, context={'request': request})
        
        return Response({
            'tipo': tipo,
            'limite': limite,
            'resultados': serializer.data
        })


from .models import Valoracion
from .serializers import ValoracionSerializer

class ValoracionCreateUpdateView(APIView):
    """
    Crear o actualizar la valoración de un producto por el comprador autenticado.
    
    Body:
    {
        "producto_id": 1,
        "puntuacion": 5,
        "comentario": "Excelente producto"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.rol != 'comprador':
            return Response({
                'error': 'Solo los compradores pueden valorar productos'
            }, status=status.HTTP_403_FORBIDDEN)
            
        producto_id = request.data.get('producto') or request.data.get('producto_id')
        puntuacion = request.data.get('puntuacion')
        comentario = request.data.get('comentario', '')
        
        if not producto_id or puntuacion is None:
            return Response({
                'error': 'producto_id y puntuacion son requeridos'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            puntuacion = int(puntuacion)
            if puntuacion < 1 or puntuacion > 5:
                raise ValueError()
        except ValueError:
            return Response({
                'error': 'puntuacion debe ser un número entero entre 1 y 5'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        producto = Producto.objects.filter(id=producto_id, estado='activo').first()
        if not producto:
            return Response({
                'error': 'Producto no encontrado o inactivo'
            }, status=status.HTTP_404_NOT_FOUND)
            
        valoracion, created = Valoracion.objects.update_or_create(
            usuario=request.user,
            producto=producto,
            defaults={
                'puntuacion': puntuacion,
                'comentario': comentario
            }
        )
        
        serializer = ValoracionSerializer(valoracion, context={'request': request})
        message = 'Valoración registrada exitosamente' if created else 'Valoración actualizada exitosamente'
        return Response({
            'message': message,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ValoracionListView(generics.ListAPIView):
    """
    Lista de valoraciones de un producto específico.
    Parámetros de consulta:
    - producto_id: ID del producto (requerido)
    """
    serializer_class = ValoracionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        producto_id = self.request.query_params.get('producto_id') or self.request.query_params.get('producto')
        if not producto_id:
            return Valoracion.objects.none()
        return Valoracion.objects.filter(producto_id=producto_id)
        
    def list(self, request, *args, **kwargs):
        producto_id = self.request.query_params.get('producto_id') or self.request.query_params.get('producto')
        if not producto_id:
            return Response({
                'error': 'producto_id es requerido como parámetro de consulta'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().list(request, *args, **kwargs)


class ValoracionDeleteView(APIView):
    """
    Eliminar la valoración del usuario autenticado para un producto.
    """
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, producto_id):
        valoracion = Valoracion.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).first()
        
        if valoracion:
            valoracion.delete()
            return Response({
                'message': 'Valoración eliminada exitosamente'
            }, status=status.HTTP_200_OK)
            
        return Response({
            'error': 'Valoración no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)


class ValoracionUsuarioProductoView(APIView):
    """
    Obtener la valoración del usuario autenticado para un producto específico.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, producto_id):
        valoracion = Valoracion.objects.filter(
            usuario=request.user,
            producto_id=producto_id
        ).first()
        
        if valoracion:
            serializer = ValoracionSerializer(valoracion, context={'request': request})
            return Response(serializer.data)
            
        return Response({
            'valorado': False
        }, status=status.HTTP_404_NOT_FOUND)


class ValoracionUsuarioListView(generics.ListAPIView):
    """
    Lista de valoraciones creadas por el usuario autenticado.
    """
    serializer_class = ValoracionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Valoracion.objects.filter(usuario=self.request.user)