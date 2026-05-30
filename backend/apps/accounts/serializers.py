# apps/accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'rol', 'rol_display', 'estado', 'telefono', 
                 'empresa', 'ruc', 'direccion', 'ubicacion', 'sitio_web', 'descripcion',
                 'profile_image', 'foto_perfil', 'fecha_creacion', 'fecha_actualizacion')
        read_only_fields = ('id', 'fecha_creacion', 'fecha_actualizacion')
    
    def to_representation(self, instance):
        """Customize the representation to handle both field names"""
        data = super().to_representation(instance)
        # Ensure profile_image is available even if using old field name
        if not data.get('profile_image') and data.get('foto_perfil'):
            data['profile_image'] = data['foto_perfil']
        return data


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
    
    class Meta:
        model = User
        fields = ('username', 'email', 'telefono', 'empresa', 'ubicacion', 
                 'sitio_web', 'descripcion', 'profile_image', 'foto_perfil')
        read_only_fields = ('email',)  # Email is read-only to prevent changes
    
    def validate_email(self, value):
        """Prevent email change"""
        if self.instance and self.instance.email != value:
            raise serializers.ValidationError("No se puede cambiar el correo electrónico")
        return value
    
    def validate_username(self, value):
        """Validate username uniqueness"""
        if self.instance and self.instance.username != value:
            if User.objects.filter(username=value).exists():
                raise serializers.ValidationError("Este nombre de usuario ya está en uso")
        return value
    
    def update(self, instance, validated_data):
        # Handle profile_image if present
        if 'profile_image' in validated_data:
            instance.foto_perfil = validated_data.get('profile_image')
            validated_data.pop('profile_image', None)
        
        # Handle foto_perfil (legacy field)
        if 'foto_perfil' in validated_data:
            instance.foto_perfil = validated_data['foto_perfil']
            validated_data.pop('foto_perfil', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance