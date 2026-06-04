import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.categories.models import Categoria
from apps.products.models import Producto
from apps.locations.models import Ubicacion

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        email="admin@test.com",
        username="adminuser",
        password="adminpassword123",
        rol="admin"
    )
    return user

@pytest.fixture
def proveedor_user(db):
    user = User.objects.create_user(
        email="proveedor@test.com",
        username="proveedoruser",
        password="proveedorpassword123",
        rol="proveedor",
        empresa="Proveedor S.A.",
        ruc="J0310000000001",
        telefono="12345678"
    )
    return user

@pytest.fixture
def other_proveedor_user(db):
    user = User.objects.create_user(
        email="otherproveedor@test.com",
        username="otherproveedor",
        password="proveedorpassword123",
        rol="proveedor",
        empresa="Otro Proveedor S.A.",
        ruc="J0310000000002",
        telefono="87654321"
    )
    return user

@pytest.fixture
def comprador_user(db):
    user = User.objects.create_user(
        email="comprador@test.com",
        username="compradoruser",
        password="compradorpassword123",
        rol="comprador",
        telefono="99999999"
    )
    return user

@pytest.fixture
def test_location(db):
    location = Ubicacion.objects.create(
        departamento="Managua",
        municipio="Managua"
    )
    return location

@pytest.fixture
def test_category(db):
    category = Categoria.objects.create(
        nombre="Tecnología",
        slug="tecnologia",
        descripcion="Equipos tecnológicos y software",
        orden=1,
        activo=True
    )
    return category

@pytest.fixture
def test_product(db, proveedor_user, test_category, test_location):
    product = Producto.objects.create(
        proveedor=proveedor_user,
        categoria=test_category,
        nombre="Laptop Dell Latitude",
        descripcion="Intel Core i7, 16GB RAM, 512GB SSD",
        precio=1200.00,
        stock=10,
        unidad_medida="unidad",
        ubicacion=test_location,
        estado="activo"
    )
    return product

@pytest.fixture
def auth_client(api_client):
    def _auth_client(user):
        api_client.force_authenticate(user=user)
        return api_client
    return _auth_client
