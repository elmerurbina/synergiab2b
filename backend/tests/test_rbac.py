import pytest
from django.urls import reverse
from apps.products.models import Producto

@pytest.mark.django_db
def test_create_product_allowed_for_proveedor(auth_client, proveedor_user, test_category, test_location):
    """Verify that a user with 'proveedor' role can create a product"""
    url = reverse('product-create')
    client = auth_client(proveedor_user)
    
    data = {
        "nombre": "Laptop Asus Zenbook",
        "descripcion": "Esta es una descripcion lo suficientemente larga que tiene mas de veinte caracteres.",
        "descripcion_corta": "Laptop Asus Zenbook i7",
        "precio": "1500.00",
        "stock": 5,
        "unidad_medida": "unidad",
        "categoria": test_category.id,
        "ubicacion": test_location.id
    }
    
    response = client.post(url, data)
    assert response.status_code == 201
    assert Producto.objects.filter(nombre="Laptop Asus Zenbook").exists()
    
    product = Producto.objects.get(nombre="Laptop Asus Zenbook")
    assert product.proveedor == proveedor_user

@pytest.mark.django_db
def test_create_product_denied_for_comprador(auth_client, comprador_user, test_category, test_location):
    """Verify that a user with 'comprador' role is forbidden from creating a product"""
    url = reverse('product-create')
    client = auth_client(comprador_user)
    
    data = {
        "nombre": "Laptop Asus Zenbook",
        "descripcion": "Esta es una descripcion lo suficientemente larga que tiene mas de veinte caracteres.",
        "descripcion_corta": "Laptop Asus Zenbook i7",
        "precio": "1500.00",
        "stock": 5,
        "unidad_medida": "unidad",
        "categoria": test_category.id,
        "ubicacion": test_location.id
    }
    
    response = client.post(url, data)
    assert response.status_code == 403
    assert not Producto.objects.filter(nombre="Laptop Asus Zenbook").exists()

@pytest.mark.django_db
def test_update_product_allowed_for_owner(auth_client, proveedor_user, test_product):
    """Verify that the owner/provider of a product can update it"""
    url = reverse('product-update', kwargs={'pk': test_product.pk})
    client = auth_client(proveedor_user)
    
    data = {
        "nombre": "Laptop Dell Latitude Modificado",
        "descripcion": "Esta descripcion tambien es larga y tiene mas de veinte caracteres.",
        "descripcion_corta": "Laptop Dell Latitude Mod",
        "precio": "1300.00",
        "stock": 8,
        "categoria": test_product.categoria.id,
        "ubicacion": test_product.ubicacion.id
    }
    
    response = client.put(url, data, format='json')
    assert response.status_code == 200
    
    # Check updated info
    test_product.refresh_from_db()
    assert test_product.nombre == "Laptop Dell Latitude Modificado"
    assert test_product.precio == 1300.00
    assert test_product.stock == 8

@pytest.mark.django_db
def test_update_product_denied_for_other_proveedor(auth_client, other_proveedor_user, test_product):
    """Verify that a different provider cannot update another provider's product"""
    url = reverse('product-update', kwargs={'pk': test_product.pk})
    client = auth_client(other_proveedor_user)
    
    data = {
        "nombre": "Laptop Dell Latitude Hackeado",
        "descripcion": "Esta descripcion tambien es larga y tiene mas de veinte caracteres.",
        "descripcion_corta": "Laptop Dell Latitude Hack",
        "precio": "1.00",
        "stock": 100,
        "categoria": test_product.categoria.id,
        "ubicacion": test_product.ubicacion.id
    }
    
    response = client.put(url, data, format='json')

    assert response.status_code == 404
    

    test_product.refresh_from_db()
    assert test_product.nombre != "Laptop Dell Latitude Hackeado"
    assert test_product.precio != 1.00
