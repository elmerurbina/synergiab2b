import pytest
from django.urls import reverse
from django.utils import timezone
from apps.products.models import Producto, ProductoPatrocinado
from apps.interactions.models import Interaccion

@pytest.mark.django_db
def test_list_products(api_client, test_product):
    """Verify that listing active products returns the active products"""
    url = reverse('product-list')
    response = api_client.get(url)
    assert response.status_code == 200
    assert 'results' in response.data
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['nombre'] == test_product.nombre

@pytest.mark.django_db
def test_retrieve_product_detail_increments_visits(api_client, test_product):
    """Verify that retrieving a product detail increments its visits and creates an interaction"""
    assert test_product.visitas == 0
    url = reverse('product-detail', kwargs={'pk': test_product.pk})
    response = api_client.get(url)
    assert response.status_code == 200

    test_product.refresh_from_db()
    assert test_product.visitas == 1

    assert Interaccion.objects.filter(producto=test_product, tipo='vista').exists()

@pytest.mark.django_db
def test_filter_products_by_category_and_price(api_client, test_product, test_category):
    """Verify filtering products by category and price range"""
    url = reverse('product-list')
    
    response = api_client.get(url, {
        'categoria': test_category.id,
        'precio_min': 1000.00,
        'precio_max': 1500.00
    })
    assert response.status_code == 200
    assert len(response.data['results']) == 1
    
    response_no_match = api_client.get(url, {
        'precio_min': 1300.00
    })
    assert response_no_match.status_code == 200
    assert len(response_no_match.data['results']) == 0

@pytest.mark.django_db
def test_sponsored_products_list(api_client, test_product):
    """Verify listing active sponsored products"""
    hoy = timezone.now().date()
    sponsored = ProductoPatrocinado.objects.create(
        producto=test_product,
        fecha_inicio=hoy,
        fecha_fin=hoy + timezone.timedelta(days=1),
        activo=True
    )
    
    url = reverse('product-sponsored')
    response = api_client.get(url)
    assert response.status_code == 200
    # Sponsored endpoint also uses pagination
    assert 'results' in response.data
    assert len(response.data['results']) == 1
    assert response.data['results'][0]['producto_info']['nombre'] == test_product.nombre
