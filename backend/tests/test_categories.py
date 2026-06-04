import pytest
from django.urls import reverse
from apps.categories.models import Categoria

@pytest.mark.django_db
def test_list_categories(api_client, test_category):
    """Verify that anyone can list root categories"""
    url = reverse('categoria-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['nombre'] == test_category.nombre
    assert response.data[0]['slug'] == test_category.slug

@pytest.mark.django_db
def test_retrieve_category_detail(api_client, test_category):
    """Verify that any user can retrieve category details by slug"""
    url = reverse('categoria-detail', kwargs={'slug': test_category.slug})
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['nombre'] == test_category.nombre
    assert response.data['slug'] == test_category.slug

@pytest.mark.django_db
def test_create_category_authenticated(auth_client, proveedor_user):
    """Verify that an authenticated user can create a category"""
    url = reverse('categoria-create')
    client = auth_client(proveedor_user)
    data = {
        "nombre": "Automotriz",
        "descripcion": "Repuestos y accesorios para vehículos"
    }
    response = client.post(url, data)
    assert response.status_code == 201
    assert response.data['nombre'] == "Automotriz"
    assert Categoria.objects.filter(nombre="Automotriz").exists()

@pytest.mark.django_db
def test_list_subcategories(api_client, test_category):
    """Verify retrieval of subcategories for a given parent category"""
    sub_category = Categoria.objects.create(
        nombre="Celulares",
        categoria_padre=test_category,
        activo=True
    )
    url = reverse('subcategorias', kwargs={'parent_id': test_category.id})
    response = api_client.get(url)
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]['nombre'] == "Celulares"
    assert response.data[0]['categoria_padre'] == test_category.id
