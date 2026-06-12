from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.conf import settings
from django.db.models import Sum
from rest_framework.pagination import PageNumberPagination
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    UpdateProfileSerializer
)
from apps.products.models import Producto
from apps.favorites.models import Favorito
from apps.interactions.models import Interaccion
import logging
import os

logger = logging.getLogger(__name__)


class UserPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Usuario registrado exitosamente'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'message': 'Login exitoso'
            })
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception as e:
            logger.error(f"Logout error: {e}")
        
        return Response({'message': 'Logout exitoso'})


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get(self, request):
        """Get user profile data"""
        serializer = UserSerializer(request.user)
        data = serializer.data
        
        # Add profile image URL if exists
        if request.user.foto_perfil and hasattr(request.user.foto_perfil, 'url'):
            data['profile_image'] = request.build_absolute_uri(request.user.foto_perfil.url)
        else:
            data['profile_image'] = None
        
        # Add statistics for proveedor role
        if request.user.rol == 'proveedor':
            data['stats'] = {
                'total_productos': Producto.objects.filter(proveedor=request.user).count(),
                'productos_activos': Producto.objects.filter(
                    proveedor=request.user, estado='activo'
                ).count(),
                'total_visitas': Producto.objects.filter(
                    proveedor=request.user
                ).aggregate(total=Sum('visitas'))['total'] or 0,
                'total_interacciones': Interaccion.objects.filter(
                    producto__proveedor=request.user
                ).count()
            }
        elif request.user.rol == 'comprador':
            data['stats'] = {
                'total_favoritos': Favorito.objects.filter(usuario=request.user).count()
            }
        
        return Response(data)
    
    def put(self, request):
        """Update user profile with image support"""
        user = request.user
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        # Handle profile image from FormData or JSON
        if request.FILES.get('profile_image'):
            # Delete old image if exists
            if user.foto_perfil and os.path.isfile(user.foto_perfil.path):
                os.remove(user.foto_perfil.path)
            
            user.foto_perfil = request.FILES['profile_image']
        elif request.FILES.get('foto_perfil'):
            # Handle legacy field name
            if user.foto_perfil and os.path.isfile(user.foto_perfil.path):
                os.remove(user.foto_perfil.path)
            
            user.foto_perfil = request.FILES['foto_perfil']
        
        # Update text fields
        if 'empresa' in data and data['empresa'] is not None:
            user.empresa = data['empresa']
        
        if 'username' in data and data['username'] is not None:
            # Check if username is taken
            if User.objects.filter(username=data['username']).exclude(id=user.id).exists():
                return Response(
                    {'error': 'Este nombre de usuario ya está en uso'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = data['username']
        
        if 'telefono' in data and data['telefono'] is not None:
            user.telefono = data['telefono']
        
        if 'ubicacion' in data and data['ubicacion'] is not None:
            user.ubicacion = data['ubicacion']
        
        if 'sitio_web' in data and data['sitio_web'] is not None:
            user.sitio_web = data['sitio_web']
        
        if 'descripcion' in data and data['descripcion'] is not None:
            user.descripcion = data['descripcion']
        
        if 'ruc' in data and data['ruc'] is not None:
            user.ruc = data['ruc']
        
        if 'direccion' in data and data['direccion'] is not None:
            user.direccion = data['direccion']
        
        # Save user
        user.save()
        
        # Return updated user data
        serializer = UserSerializer(user)
        response_data = serializer.data
        
        # Add full image URL
        if user.foto_perfil and hasattr(user.foto_perfil, 'url'):
            response_data['profile_image'] = request.build_absolute_uri(user.foto_perfil.url)
        else:
            response_data['profile_image'] = None
        
        return Response({
            'user': response_data,
            'message': 'Perfil actualizado exitosamente'
        })
    
    def patch(self, request):
        """Partial update user profile"""
        return self.put(request)


class ChangePasswordView(APIView):
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


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return response


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pagination_class = UserPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'empresa']
    ordering_fields = ['fecha_creacion', 'email', 'username']
    
    def get_queryset(self):
        queryset = User.objects.all()
        
        rol = self.request.query_params.get('rol')
        if rol and rol in ['admin', 'proveedor', 'comprador']:
            queryset = queryset.filter(rol=rol)
        
        estado = self.request.query_params.get('estado')
        if estado:
            queryset = queryset.filter(estado=estado.lower() == 'true')
        
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ProveedorListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    pagination_class = UserPagination
    
    def get_queryset(self):
        return User.objects.filter(rol='proveedor', estado=True)


class ProveedorDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer
    
    def get_queryset(self):
        return User.objects.filter(rol='proveedor', estado=True)