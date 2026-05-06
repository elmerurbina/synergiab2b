from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Interaccion
from .serializers import InteraccionSerializer
from apps.products.models import Producto


class InteraccionCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        producto_id = request.data.get('producto_id')
        tipo = request.data.get('tipo')
        
        if not producto_id or not tipo:
            return Response({'error': 'producto_id y tipo son requeridos'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        producto = Producto.objects.filter(id=producto_id).first()
        if not producto:
            return Response({'error': 'Producto no encontrado'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        interaccion = Interaccion.objects.create(
            producto=producto,
            usuario=request.user,
            tipo=tipo,
            ip=self.get_client_ip(request)
        )
        
        # If it's a WhatsApp click, register on the product
        if tipo == 'click_whatsapp':
            # You could add additional logic here
            pass
        
        serializer = InteraccionSerializer(interaccion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class EstadisticasView(APIView):
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        hoy = timezone.now()
        semana = hoy - timedelta(days=7)
        mes = hoy - timedelta(days=30)
        
        # General statistics
        total_interacciones = Interaccion.objects.count()
        total_vistas = Interaccion.objects.filter(tipo='vista').count()
        total_clicks = Interaccion.objects.filter(tipo='click_whatsapp').count()
        
        # Most viewed products
        productos_populares = Producto.objects.annotate(
            total_vistas=Count('interacciones', filter=Q(interacciones__tipo='vista'))
        ).order_by('-total_vistas')[:10]
        
        # Weekly statistics
        stats_semana = Interaccion.objects.filter(fecha__gte=semana).values('tipo').annotate(
            count=Count('id')
        )
        
        # Monthly statistics
        stats_mes = Interaccion.objects.filter(fecha__gte=mes).values('tipo').annotate(
            count=Count('id')
        )
        
        from apps.products.serializers import ProductoListSerializer
        
        return Response({
            'total': {
                'interacciones': total_interacciones,
                'vistas': total_vistas,
                'clicks_whatsapp': total_clicks,
            },
            'semana': stats_semana,
            'mes': stats_mes,
            'productos_populares': ProductoListSerializer(productos_populares, many=True, context={'request': request}).data
        })


class ProductoEstadisticasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, producto_id):
        producto = Producto.objects.filter(id=producto_id).first()
        if not producto:
            return Response({'error': 'Producto no encontrado'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Check if user owns the product
        if producto.proveedor != request.user and not request.user.is_superuser:
            return Response({'error': 'No autorizado'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        stats = Interaccion.objects.filter(producto=producto).values('tipo').annotate(
            count=Count('id')
        )
        
        return Response({
            'producto_id': producto_id,
            'producto_nombre': producto.nombre,
            'estadisticas': stats,
            'total_interacciones': Interaccion.objects.filter(producto=producto).count()
        })