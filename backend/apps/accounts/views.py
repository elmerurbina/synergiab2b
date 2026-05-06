from rest_framework import status, generics, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer
)


class RegisterView(APIView):
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
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        response = Response({'message': 'Logout exitoso'})
        response.delete_cookie(settings.ACCESS_TOKEN_COOKIE_NAME)
        response.delete_cookie(settings.REFRESH_TOKEN_COOKIE_NAME)
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data['old_password']):
                return Response({'old_password': 'Contraseña actual incorrecta'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data['new_password'])
            user.save()
            return Response({'message': 'Contraseña cambiada exitosamente'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get(settings.REFRESH_TOKEN_COOKIE_NAME)
        if not refresh_token:
            return Response({'error': 'No refresh token provided'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
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
            return Response({'error': 'Invalid refresh token'}, 
                          status=status.HTTP_401_UNAUTHORIZED)


class UserListView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = UserSerializer
    pagination_class = PageNumberPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'username', 'empresa']
    ordering_fields = ['fecha_creacion', 'email', 'rol']
    
    def get_queryset(self):
        queryset = User.objects.all()
        rol = self.request.query_params.get('rol', None)
        estado = self.request.query_params.get('estado', None)
        
        if rol:
            queryset = queryset.filter(rol=rol)
        if estado:
            queryset = queryset.filter(estado=estado.lower() == 'true')
        
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        user.estado = False
        user.save()
        return Response({'message': 'Usuario desactivado exitosamente'})