# SinergiaB2B - Plataforma de Comercio B2B para Nicaragua


## 📋 Descripción General

SinergiaB2B es una plataforma tecnológica de comercio business-to-business (B2B) diseñada específicamente para el mercado nicaragüense. Nuestra misión es transformar la forma en que las empresas nicaragüenses se conectan, negocian y crecen juntas.

### 🎯 Propósito

La plataforma elimina intermediarios y procesos tradicionales ineficientes, permitiendo que compradores y proveedores se conecten de manera directa, ágil y transparente a través de un ecosistema digital moderno e intuitivo.

### ✨ Características Principales

- **Catálogo Digital Inteligente**: Búsqueda avanzada por categorías, precios, ubicación y más
- **Conexión Directa vía WhatsApp**: Comunicación instantánea entre compradores y proveedores
- **Dashboard de Proveedores**: Estadísticas en tiempo real, gestión de productos y análisis de rendimiento
- **Sistema de Valoraciones**: Reputación transparente que genera confianza en el ecosistema
- **Roles de Usuario**: Compradores, Proveedores y Administradores con permisos específicos
- **Interfaz Responsive**: Experiencia optimizada en dispositivos móviles, tablets y desktop

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuario
- **React Router DOM** - Navegación y enrutamiento
- **CSS Modules** - Estilos encapsulados y mantenibles
- **React Icons** - Iconografía moderna y consistente
- **React Toastify** - Notificaciones interactivas
- **Axios** - Cliente HTTP para API calls

### Backend
- **Django 4.x** - Framework web Python de alto nivel
- **Django REST Framework** - API RESTful robusta
- **SQLite** - Base de datos relacional (desarrollo)
- **Django CORS Headers** - Manejo de políticas CORS
- **JWT Authentication** - Autenticación segura basada en tokens

## 📊 Estructura del Proyecto
SinergiaB2B/

├── backend/ # API Django REST

│ ├── api/ # Aplicación principal

│ │ ├── models.py # Modelos de datos

│ │ ├── views.py # Vistas y lógica de negocio

│ │ ├── serializers.py # Serializadores DRF

│ │ └── urls.py # Rutas de la API

│ ├── sinergiab2b/ # Configuración del proyecto

│ ├── manage.py # Script de gestión Django

│ └── requirements.txt # Dependencias Python

│
├── frontend/ # Aplicación React

│ ├── public/ # Archivos estáticos

│ ├── src/

│ │ ├── components/ # Componentes reutilizables

│ │ ├── contexts/ # Contextos de React

│ │ ├── pages/ # Vistas principales

│ │ ├── services/ # Servicios API

│ │ ├── styles/ # Estilos globales

│ │ └── App.js # Componente principal

│ └── package.json # Dependencias Node.js

│
└── README.md # Documentación




## 🛠️ Instalación y Configuración

### Requisitos Previos

- **Python 3.12+** - [Descargar Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Descargar Node.js](https://nodejs.org/)
- **Git** - [Descargar Git](https://git-scm.com/)
- **pip** - Gestor de paquetes de Python (viene con Python)
- **npm** - Gestor de paquetes de Node.js (viene con Node.js)

### 1. Clonar el Repositorio

`git clone https://github.com/elmerurbina/sinergiab2b.git`


2. Configuración del Backend (Django)
Navegar al directorio del backend:

`cd backend`


## Instalar dependencias de Python:

`pip install -r requirements.txt`

## Configurar variables de entorno:
Crea un archivo .env en el directorio 
backend/ con el siguiente contenido:

```
env
SECRET_KEY=tu-clave-secreta-django-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
Nota: Para producción, genera una clave secreta segura usando:
```
python
```
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

## Ejecutar migraciones de base de datos (SQLite):
```
python manage.py makemigrations
python manage.py migrate
```
### Crear superusuario (acceso admin):

`python manage.py createsuperuser`

_Sigue las instrucciones para crear un usuario administrador._

Iniciar el servidor de desarrollo:

`python manage.py runserver`

El backend estará disponible en: *http://localhost:8000*

API Admin: http://localhost:8000/admin

API Endpoints: *http://localhost:8000/api/*

## 3. Configuración del Frontend (React)

Abrir una nueva terminal y navegar a la raíz del proyecto:


**Si estás en el directorio backend, regresa a la raíz**

`cd ..`

Instalar dependencias de Node.js:

`npm install --ignore-scripts`

**Nota sobre --ignore-scripts: Este flag se utiliza para evitar posibles scripts maliciosos o problemas de compatibilidad con algunas dependencias.**

## Configurar variables de entorno del frontend:

Crea un archivo .env en la raíz del proyecto:

env

```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000
```

Iniciar el servidor de desarrollo:

`npm start`

El frontend estará disponible en: http://localhost:3000

🎮 Uso de la Plataforma
Acceso a la aplicación
Abre tu navegador y ve a http://localhost:3000

Regístrate como nuevo usuario o inicia sesión

Explora las diferentes secciones según tu rol:

Roles y Funcionalidades
🛍️ Comprador
Navegar y buscar productos por categorías

Ver detalles de productos

Contactar proveedores vía WhatsApp

Ver estadísticas básicas

🏢 Proveedor
Dashboard de Proveedor: Estadísticas de rendimiento

Gestión de Catálogo: CRUD de productos

Análisis de Visitas: Seguimiento de interacciones

Métricas de WhatsApp: Clics y contactos

👑 Administrador
Panel de Administración: Gestión completa del sistema

Gestión de Usuarios: Crear, modificar, eliminar usuarios

Moderación de Productos: Validar y gestionar catálogos

Estadísticas Globales: Métricas de toda la plataforma

🔧 Solución de Problemas Comunes
Error: products.slice is not a function
Solución: Asegúrate de que la API está devolviendo un array. Verifica la respuesta en la consola del navegador.

Error: CORS policy
Solución: Verifica que CORS_ALLOWED_ORIGINS en backend .env incluya http://localhost:3000

Error: Module not found
Solución: Ejecuta npm install nuevamente sin el flag --ignore-scripts

Error: Database table doesn't exist
Solución: Ejecuta python manage.py migrate nuevamente

El servidor no inicia (puerto en uso)
Backend: Cambia el puerto: python manage.py runserver 8001
Frontend: Cambia el puerto: npm start -- --port 3001

📦 Scripts Disponibles

Backend
```
python manage.py runserver              # Inicia servidor
python manage.py makemigrations         # Crea migraciones
python manage.py migrate                # Aplica migraciones
python manage.py createsuperuser        # Crea admin user
python manage.py shell                  # Consola interactiva
python manage.py test                   # Ejecuta tests

```
Frontend
```
npm start                               # Inicia servidor desarrollo
npm run build                           # Construye para producción
npm test                                # Ejecuta tests
npm run eject                           # Expone configuración (irreversible)
🌐 Variables de Entorno
Backend (.env)
env
SECRET_KEY=tu-clave-secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
Frontend (.env)
env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_API_TIMEOUT=30000
```
🤝 Contribución
Fork el proyecto

Crea tu rama de características (`git checkout -b feature/AmazingFeature`)

Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)

Push a la rama (`git push origin feature/AmazingFeature`)

Abre un Pull Request

Estándares de Código

Frontend: ESLint + Prettier

Backend: PEP 8 (usando flake8)

📄 Licencia
Este proyecto es privado, para uso comercial favor contactar a los desarrolladores. Se permite su uso libre solo para fines educativos, pero NO para comercializacion 

📞 Contacto y Soporte

Email: soporte@sinergiab2b.com



GitHub Issues: Reportar bug

🙏 Agradecimientos

A todos los emprendedores y empresas nicaragüenses que confían en nuestra plataforma

Equipo de desarrollo y diseño por su dedicación y pasión

