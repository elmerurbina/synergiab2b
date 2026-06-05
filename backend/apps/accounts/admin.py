# apps/accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from django import forms
from .models import User


class UserChangeFormCustom(UserChangeForm):
    """Custom form for editing users in admin"""
    
    class Meta(UserChangeForm.Meta):
        model = User
        fields = '__all__'


class UserCreationFormCustom(UserCreationForm):
    """Custom form for creating users in admin"""
    
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'username', 'rol', 'estado')
    
    def clean_email(self):
        """Validate email uniqueness"""
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Este correo electrónico ya está registrado.')
        return email


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom admin interface for User model with full superuser capabilities
    """
    
    # Use custom forms
    form = UserChangeFormCustom
    add_form = UserCreationFormCustom
    
    # Display fields in list view
    list_display = (
        'email', 
        'username', 
        'get_full_name', 
        'rol', 
        'estado',
        'empresa',
        'telefono',
        'fecha_creacion',
        'last_login'
    )
    
    # Filters for sidebar
    list_filter = (
        'rol', 
        'estado', 
        'is_staff', 
        'is_superuser', 
        'is_active',
        'fecha_creacion',
        'date_joined'
    )
    
    # Search fields
    search_fields = (
        'email', 
        'username', 
        'first_name', 
        'last_name', 
        'empresa', 
        'ruc', 
        'telefono'
    )
    
    # Fields to display in detail view
    fieldsets = (
        (None, {
            'fields': ('email', 'username', 'password')
        }),
        (_('Personal Information'), {
            'fields': (
                'first_name', 
                'last_name', 
                'telefono', 
                'foto_perfil'
            )
        }),
        (_('Role & Status'), {
            'fields': ('rol', 'estado', 'is_active', 'is_staff', 'is_superuser'),
            'classes': ('wide',),
        }),
        (_('Business Information (for Proveedores)'), {
            'fields': (
                'empresa', 
                'ruc', 
                'direccion',
                'ubicacion',
                'sitio_web',
                'descripcion'
            ),
            'classes': ('collapse',),
        }),
        (_('Permissions'), {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        (_('Important Dates'), {
            'fields': ('last_login', 'date_joined', 'fecha_creacion', 'fecha_actualizacion'),
            'classes': ('collapse',),
        }),
    )
    
    # Fields for add form
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 
                'username', 
                'password1', 
                'password2', 
                'rol', 
                'estado',
                'first_name',
                'last_name',
                'telefono'
            ),
        }),
        (_('Business Information'), {
            'classes': ('wide', 'collapse'),
            'fields': ('empresa', 'ruc', 'direccion', 'ubicacion', 'sitio_web', 'descripcion'),
        }),
    )
    
    # Readonly fields
    readonly_fields = (
        'fecha_creacion', 
        'fecha_actualizacion', 
        'date_joined', 
        'last_login'
    )
    
    # Ordering
    ordering = ('-fecha_creacion',)
    
    # List editable fields (inline editing)
    list_editable = ('rol', 'estado')
    
    # Number of items per page
    list_per_page = 25
    
    # Actions
    actions = [
        'activate_users', 
        'deactivate_users', 
        'make_admin', 
        'make_proveedor', 
        'make_comprador'
    ]
    
    # Radio buttons for filter
    radio_fields = {'rol': admin.HORIZONTAL}
    
    # Raw ID fields for foreign keys
    raw_id_fields = ('groups',)
    
    # Save on top
    save_on_top = True
    
    # List select related (optimize queries)
    list_select_related = True
    
    # Date hierarchy
    date_hierarchy = 'fecha_creacion'
    
    # Custom actions
    @admin.action(description='Activar usuarios seleccionados')
    def activate_users(self, request, queryset):
        """Activate selected users"""
        updated = queryset.update(estado=True, is_active=True)
        self.message_user(request, f'{updated} usuario(s) activado(s) correctamente.')
    
    @admin.action(description='Desactivar usuarios seleccionados')
    def deactivate_users(self, request, queryset):
        """Deactivate selected users"""
        # Prevent deactivating superusers
        queryset = queryset.filter(is_superuser=False)
        updated = queryset.update(estado=False, is_active=False)
        self.message_user(request, f'{updated} usuario(s) desactivado(s) correctamente.')
    
    @admin.action(description='Cambiar rol a Administrador')
    def make_admin(self, request, queryset):
        """Change selected users to admin role"""
        updated = queryset.update(rol='admin', is_staff=True)
        self.message_user(request, f'{updated} usuario(s) cambiado(s) a Administrador.')
    
    @admin.action(description='Cambiar rol a Proveedor')
    def make_proveedor(self, request, queryset):
        """Change selected users to proveedor role"""
        updated = queryset.update(rol='proveedor')
        self.message_user(request, f'{updated} usuario(s) cambiado(s) a Proveedor.')
    
    @admin.action(description='Cambiar rol a Comprador')
    def make_comprador(self, request, queryset):
        """Change selected users to comprador role"""
        updated = queryset.update(rol='comprador')
        self.message_user(request, f'{updated} usuario(s) cambiado(s) a Comprador.')
    
    # Custom method to display full name
    def get_full_name(self, obj):
        """Display full name or business name"""
        if obj.empresa:
            return f"{obj.empresa} ({obj.get_full_name() or obj.username})"
        return obj.get_full_name() or obj.username
    get_full_name.short_description = 'Nombre completo / Empresa'
    get_full_name.admin_order_field = 'first_name'
    
    # Override save_model to handle superuser permissions
    def save_model(self, request, obj, form, change):
        """Custom save behavior"""
        # Prevent regular users from changing superuser status
        if not request.user.is_superuser:
            if change and 'is_superuser' in form.changed_data:
                self.message_user(
                    request, 
                    'No tienes permisos para cambiar el estado de superusuario.',
                    level='ERROR'
                )
                return
        
        super().save_model(request, obj, form, change)
    
    # Override get_queryset to show all users
    def get_queryset(self, request):
        """Show all users including superusers"""
        qs = super().get_queryset(request)
        return qs
    
    # Custom permissions
    def has_view_permission(self, request, obj=None):
        """Allow all staff to view users"""
        return request.user.is_staff
    
    def has_change_permission(self, request, obj=None):
        """Allow superusers to change any user"""
        if request.user.is_superuser:
            return True
        return super().has_change_permission(request, obj)
    
    def has_delete_permission(self, request, obj=None):
        """Allow superusers to delete any user"""
        if request.user.is_superuser:
            return True
        # Prevent users from deleting themselves
        if obj and obj == request.user:
            return False
        return super().has_delete_permission(request, obj)


# Optional: Register UserAdmin with custom templates for better UX
admin.site.site_header = 'Panel de Administración'
admin.site.site_title = 'Administración de Usuarios'
admin.site.index_title = 'Bienvenido al Panel de Administración'