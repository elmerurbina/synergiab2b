from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q, Count
from rest_framework.pagination import PageNumberPagination
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer
)
from apps.products.models import Producto
from apps.favorites.models import Favorito


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_query_param = 'page'


class RegisterView(APIView):
    """
    Registro de nuevos usuarios (compradores o proveedores).
    
    Body:
    {
        "email": "usuario@ejemplo.com",
        "username": "usuario",
        "password": "contraseña123",
        "password2": "contraseña123",
        "rol": "comprador | proveedor",
        "empresa": "Nombre Empresa (opcional)",
        "telefono": "12345678 (opcional)"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            response = Response({
                'user': UserSerializer(user).data,
                'message': 'Usuario registrado exitosamente'
            }, status=status.HTTP_201_CREATED)
            
            # Set cookies
            response.set_cookie(
                settings.ACCESS_TOKEN_COOKIE_NAME,
                str(refresh.access_token),
                httponly=True,
                samesite='Lax',
                max_age=settings.ACCESS_TOKEN_COOKIE_AGE
            )
            response.set_cookie(
                settings.REFRESH_TOKEN_COOKIE_NAME,
                str(refresh),
                httponly=True,
                samesite='Lax',
                max_age=settings.REFRESH_TOKEN_COOKIE_AGE
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    Inicio de sesión de usuarios.
    
    Body:
    {
        "email": "usuario@ejemplo.com",
        "password": "contraseña123"
    }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            response = Response({
                'user': UserSerializer(user).data,
                'message': 'Login exitoso'
            })
            
            response.set_cookie(
                settings.ACCESS_TOKEN_COOKIE_NAME,
                str(refresh.access_token),
                httponly=True,
                samesite='Lax',
                max_age=settings.ACCESS_TOKEN_COOKIE_AGE
            )
            response.set_cookie(
                settings.REFRESH_TOKEN_COOKIE_NAME,
                str(refresh),
                httponly=True,
                samesite='Lax',
                max_age=settings.REFRESH_TOKEN_COOKIE_AGE
            )
            return response
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    Cierre de sesión - Elimina las cookies de autenticación.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = Response({'message': 'Logout exitoso'})
        response.delete_cookie(settings.ACCESS_TOKEN_COOKIE_NAME)
        response.delete_cookie(settings.REFRESH_TOKEN_COOKIE_NAME)
        return response


class ProfileView(APIView):
    """
    Obtener o actualizar el perfil del usuario autenticado.
    
    Parámetros GET: Ninguno
    Body PUT: Campos a actualizar (email, username, telefono, empresa, direccion, foto_perfil)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Obtener perfil del usuario"""
        serializer = UserSerializer(request.user)
        data = serializer.data
        
        # Agregar estadísticas adicionales según el rol
        if request.user.rol == 'proveedor':
            data['stats'] = {
                'total_productos': Producto.objects.filter(proveedor=request.user).count(),
                'productos_activos': Producto.objects.filter(
                    proveedor=request.user, estado='activo'
                ).count(),
                'total_visitas': Producto.objects.filter(
                    proveedor=request.user
                ).aggregate(total=models.Sum('visitas'))['total'] or 0
            }
        elif request.user.rol == 'comprador':
            data['stats'] = {
                'total_favoritos': Favorito.objects.filter(usuario=request.user).count()
            }
        
        return Response(data)
    
    def put(self, request):
        """Actualizar perfil del usuario"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    Cambiar contraseña del usuario autenticado.
    
    Body:
    {
        "old_password": "contraseña_actual",
        "new_password": "nueva_contraseña",
        "confirm_password": "nueva_contraseña"
    }
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'old_password': 'Contraseña actual incorrecta'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'message': 'Contraseña cambiada exitosamente'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    """
    Refrescar el token de acceso usando el refresh token de las cookies.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE_NAME)
        if not refresh_token:
            return Response(
                {'error': 'No refresh token provided'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({'message': 'Token refreshed'})
            response.set_cookie(
                settings.ACCESS_TOKEN_COOKIE_NAME,
                access_token,
                httponly=True,
                samesite='Lax',
                max_age=settings.ACCESS_TOKEN_COOKIE_AGE
            )
            return response
        except Exception:
            return Response(
                {'error': 'Invalid refresh token'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class UserListView(generics.ListAPIView):
    """
    Lista de usuarios (Solo administradores).
    
    Parámetros de consulta:
    - page: Número de página
    - page_size: Elementos por página
    - search: Buscar por email, username o empresa
    - rol: Filtrar por rol (admin, proveedor, comprador)
    - estado: Filtrar por estado (true, false)
    - ordering: Ordenar por fecha_creacion, email, username
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'empresa']
    ordering_fields = ['fecha_creacion', 'email', 'username']
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        # Filtrar por rol
        rol = self.request.query_params.get('rol')
        if rol and rol in ['admin', 'proveedor', 'comprador']:
            queryset = queryset.filter(rol=rol)
        
        # Filtrar por estado
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado.lower() == 'true')
        
        # Ordenamiento
        ordering = self.request.query_params.get('ordering', '-fecha_creacion')
        allowed_orderings = ['fecha_creacion', '-fecha_creacion', 'email', '-email', 'username', '-username']
        if ordering in allowed_orderings:
            queryset = queryset.order_by(ordering)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        # Estadísticas generales
        stats = {
            'total_usuarios': User.objects.count(),
            'total_proveedores': User.objects.filter(rol='proveedor').count(),
            'total_compradores': User.objects.filter(rol='comprador').count(),
            'total_activos': User.objects.filter(estado=True).count(),
            'total_inactivos': User.objects.filter(estado=False).count()
        }
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'stats': stats,
                'results': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'stats': stats,
            'results': serializer.data
        })


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Obtener, actualizar o eliminar un usuario específico (Solo administradores).
    
    Parámetros URL:
    - pk: ID del usuario
    """
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Agregar información adicional según el rol
        if instance.rol == 'proveedor':
            data['productos'] = {
                'total': Producto.objects.filter(proveedor=instance).count(),
                'activos': Producto.objects.filter(proveedor=instance, estado='activo').count(),
                'inactivos': Producto.objects.filter(proveedor=instance, estado='inactivo').count(),
                'pendientes': Producto.objects.filter(proveedor=instance, estado='pendiente').count(),
                'total_visitas': Producto.objects.filter(proveedor=instance).aggregate(
                    total=models.Sum('visitas')
                )['total'] or 0
            }
        
        return Response(data)
    
    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        # Soft delete - desactivar en lugar de eliminar
        user.estado = False
        user.save()
        return Response({'message': 'Usuario desactivado exitosamente'})


class ProveedorListView(generics.ListAPIView):
    """
    Lista pública de proveedores activos.
    
    Parámetros de consulta:
    - page: Número de página
    - page_size: Elementos por página
    - search: Buscar por empresa o email
    - categoria: Filtrar por categoría de productos
    - ubicacion: Filtrar por ubicación
    - ordering: Ordenar por empresa, fecha_creacion
    """
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['empresa', 'email', 'username']
    ordering_fields = ['empresa', 'fecha_creacion']
    
    def get_queryset(self):
        queryset = User.objects.filter(rol='proveedor', estado=True)
        
        # Filtrar por categoría de productos
        categoria = self.request.query_params.get('categoria')
        if categoria:
            queryset = queryset.filter(
                productos__categoria_id=categoria,
                productos__estado='activo'
            ).distinct()
        
        # Filtrar por ubicación
        ubicacion = self.request.query_params.get('ubicacion')
        if ubicacion:
            queryset = queryset.filter(
                Q(ubicaciones__ubicacion_id=ubicacion) |
                Q(productos__ubicacion_id=ubicacion)
            ).distinct()
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            data = serializer.data
            
            # Agregar conteo de productos por proveedor
            for proveedor_data in data:
                proveedor_data['total_productos'] = Producto.objects.filter(
                    proveedor_id=proveedor_data['id'],
                    estado='activo'
                ).count()
            
            return self.get_paginated_response(data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ProveedorDetailView(generics.RetrieveAPIView):
    """
    Detalle público de un proveedor específico.
    
    Parámetros URL:
    - pk: ID del proveedor
    """
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.filter(rol='proveedor', estado=True)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Agregar información del proveedor
        data['productos'] = {
            'total': Producto.objects.filter(proveedor=instance, estado='activo').count(),
            'destacados': Producto.objects.filter(
                proveedor=instance, 
                estado='activo'
            ).order_by('-visitas')[:5].values('id', 'nombre', 'precio')
        }
        
        data['ubicaciones'] = list(instance.ubicaciones.values(
            'id', 'ubicacion__departamento', 'ubicacion__municipio', 'es_principal'
        ))
        
        return Response(data)


class EstadisticasUsuarioView(APIView):
    """
    Estadísticas del usuario autenticado.
    
    Parámetros:
    - periodo: dia, semana, mes, año
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        periodo = request.query_params.get('periodo', 'mes')
        from django.utils import timezone
        from datetime import timedelta
        
        hoy = timezone.now()
        rangos = {
            'dia': hoy - timedelta(days=1),
            'semana': hoy - timedelta(days=7),
            'mes': hoy - timedelta(days=30),
            'año': hoy - timedelta(days=365)
        }
        fecha_inicio = rangos.get(periodo, rangos['mes'])
        
        data = {
            'usuario': {
                'id': request.user.id,
                'email': request.user.email,
                'username': request.user.username,
                'rol': request.user.rol,
                'fecha_registro': request.user.fecha_creacion
            }
        }
        
        if request.user.rol == 'proveedor':
            # Estadísticas para proveedores
            productos = Producto.objects.filter(proveedor=request.user)
            data['estadisticas'] = {
                'total_productos': productos.count(),
                'productos_activos': productos.filter(estado='activo').count(),
                'total_visitas': productos.aggregate(total=models.Sum('visitas'))['total'] or 0,
                'visitas_periodo': Interaccion.objects.filter(
                    producto__in=productos,
                    tipo='vista',
                    fecha__gte=fecha_inicio
                ).count(),
                'clicks_periodo': Interaccion.objects.filter(
                    producto__in=productos,
                    tipo='click_whatsapp',
                    fecha__gte=fecha_inicio
                ).count()
            }
            
            # Top productos
            top_productos = productos.order_by('-visitas')[:5].values('id', 'nombre', 'visitas')
            data['top_productos'] = list(top_productos)
            
        elif request.user.rol == 'comprador':
            # Estadísticas para compradores
            from apps.interactions.models import Interaccion
            data['estadisticas'] = {
                'total_favoritos': Favorito.objects.filter(usuario=request.user).count(),
                'interacciones_periodo': Interaccion.objects.filter(
                    usuario=request.user,
                    fecha__gte=fecha_inicio
                ).count(),
                'vistas_periodo': Interaccion.objects.filter(
                    usuario=request.user,
                    tipo='vista',
                    fecha__gte=fecha_inicio
                ).count(),
                'contactos_periodo': Interaccion.objects.filter(
                    usuario=request.user,
                    tipo='contacto',
                    fecha__gte=fecha_inicio
                ).count()
            }
            
            # Últimos favoritos
            ultimos_favoritos = Favorito.objects.filter(
                usuario=request.user
            ).order_by('-fecha')[:5].values('producto__id', 'producto__nombre')
            data['ultimos_favoritos'] = list(ultimos_favoritos)
        
        return Response(data)


# Import at the bottom to avoid circular imports
from django.db import models
from apps.interactions.models import Interaccion