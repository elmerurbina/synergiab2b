from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'rol', 'rol_display', 'estado', 'telefono', 
                 'empresa', 'ruc', 'direccion', 'ubicacion', 'sitio_web', 'descripcion',
                 'profile_image', 'foto_perfil', 'fecha_creacion', 'fecha_actualizacion')
        read_only_fields = ('id', 'fecha_creacion', 'fecha_actualizacion')
    
    def get_profile_image(self, obj):
        if obj.foto_perfil and hasattr(obj.foto_perfil, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.foto_perfil.url)
            return obj.foto_perfil.url
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password2', 'rol', 'empresa', 
                 'telefono', 'ubicacion', 'sitio_web')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        
        # Validate email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "Este correo ya está registrado"})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Manual authentication since Django's authenticate doesn't work with email by default
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                if not user.estado:
                    raise serializers.ValidationError("Usuario inactivo")
                attrs['user'] = user
                return attrs
            else:
                raise serializers.ValidationError("Credenciales inválidas")
        except User.DoesNotExist:
            raise serializers.ValidationError("Credenciales inválidas")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Las contraseñas no coinciden"})
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer specifically for updating user profile"""
    profile_image = serializers.ImageField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ('username', 'telefono', 'empresa', 'ubicacion', 
                 'sitio_web', 'descripcion', 'ruc', 'direccion', 'profile_image')
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if self.instance and self.instance.username != value:
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Este nombre de usuario ya está en uso")
        return value
    
    def update(self, instance, validated_data):
        # Handle profile_image
        profile_image = validated_data.pop('profile_image', None)
        
        if profile_image:
            # Delete old image if exists
            if instance.foto_perfil and hasattr(instance.foto_perfil, 'path'):
                import os
                if os.path.isfile(instance.foto_perfil.path):
                    os.remove(instance.foto_perfil.path)
            instance.foto_perfil = profile_image
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance