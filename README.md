# Restaurant API - Documentación

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)

API para gestión de restaurantes, reseñas y usuarios con autenticación JWT y control de roles.

## Tabla de Contenidos

1. [Modelos de Datos](#modelos-de-datos)
2. [Endpoints](#endpoints)
   - [Usuarios](#usuarios)
   - [Restaurantes](#restaurantes)
   - [Reseñas](#reseñas)
3. [Ejemplos en Insomnia](#ejemplos-en-insomnia)
4. [Variables de Entorno](#variables-de-entorno)
5. [Instalación](#instalación)
6. [Otras recomendaciones](#otras-recomendaciones)

## Modelos de Datos

### 1. Usuario
```javascript
{
  "_id": ObjectId,
  "auth": {
    "email": String,       // único
    "password": String,    // encriptada
    "salt": String,        // para encriptación
    "roles": [String]      // ej: ["user", "admin"]
  },
  "profile": {
    "name": String,
    "avatar": String       // URL
  },
  "metadata": {
    "created_at": Date,
    "last_login": Date,
    "active": Boolean
  }
}
```

### 2. Restaurante
```javascript
{
  "_id": ObjectId,
  "name": String,
  "images": String,       // URL
  "rating": {
    "average": Number,     // 0-5
    "count": Number
  },
  "location": String,
  "contact": {
    "phone": String,
    "email": String,
    "website": String
  },
  "tags": [String],
  "created_at": Date,
  "updated_at": Date
}
```

### 3. Reseña
```javascript
{
  "_id": ObjectId,
  "restaurant_id": ObjectId,  // Ref a Restaurante
  "user_id": ObjectId,        // Ref a Usuario
  "rating": Number,           // 1-5
  "comment": String,
  "images": [String],         // URLs
  "date": Date
}
```

## Endpoints

### Usuarios

| Método | Endpoint           | Descripción                     | Auth | Roles     |
|--------|--------------------|---------------------------------|------|-----------|
| GET    | `/users/`          | Obtener todos los perfiles de usuario | Sí   | user/admin|
| GET    | `/users/profile`   | Obtener perfil usuario          | Sí   | user/admin|
| POST   | `/users/register`  | Registrar nuevo usuario         | No   | -         |
| POST   | `/users/login`     | Iniciar sesión                  | No   | -         |
| PUT    | `/users/profile`   | Actualizar perfil               | Sí   | user/admin|
| GET    | `/users/logout/:id`   | Deshabilitar un usuario      | Sí   | user/admin|
| GET    | `/users/:id`   | Eliminar el registro de un usuario  | Sí   | admin|

### Restaurantes

| Método | Endpoint           | Descripción                     | Auth | Roles     |
|--------|--------------------|---------------------------------|------|-----------|
| GET    | `/restaurants`     | Obtener todos los restaurantes  | No   | -         |
| GET    | `/restaurants/:id` | Obtener un restaurante          | No   | -         |
| POST   | `/restaurants`     | Crear nuevo restaurante         | Sí   | admin     |
| PUT    | `/restaurants/:id` | Actualizar restaurante          | Sí   | admin     |
| DELETE | `/restaurants/:id` | Eliminar restaurante            | Sí   | admin     |

### Reseñas

| Método | Endpoint                          | Descripción                     | Auth | Roles     |
|--------|-----------------------------------|---------------------------------|------|-----------|
| GET    | `/reviews`                        | Obtener todas las reseñas       | No   | -         |
| GET    | `/reviews/restaurant/:restaurantId` | Reseñas por restaurante        | No   | -         |
| POST   | `/reviews/restaurant/:restaurantId` | Crear reseña                  | Sí   | user      |
| PUT    | `/reviews/:reviewId`              | Actualizar reseña              | Sí   | user      |
| DELETE | `/reviews/:reviewId`              | Eliminar reseña                | Sí   | user      |

## Ejemplos en Insomnia

### 1. Registrar Usuario
**Request**:
```json
POST http://localhost:3000/api/users/register
Headers:
  Content-Type: application/json
Body:
  {
    "email": "usuario@ejemplo.com",
    "password": "password123",
    "name": "Juan Pérez"
  }
```

**Response**:
```json
{
  "token": "eyJhbGci...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0",
    "profile": {
      "name": "Juan Pérez"
    },
    "auth": {
      "email": "usuario@ejemplo.com",
      "roles": ["user"]
    }
  }
}
```

### 2. Crear Restaurante (como admin)
**Request**:
```json
POST http://localhost:3000/api/restaurants
Headers:
  Authorization: Bearer eyJhbGci... //token de tu usuario
  Content-Type: application/json
Body:
  {
    "name": "La Cocina de Mamá",
    "images": "https://ejemplo.com/rest1.jpg",
    "location": "Av. Principal 123",
    "contact": {
      "phone": "+123456789",
      "email": "contacto@lacocina.com"
    },
    "tags": ["tradicional", "familia"]
  }
```

### 3. Crear Reseña
**Request**:
```json
POST http://localhost:3000/api/reviews/restaurant/:ID_Restaurante
Headers:
  Authorization: Bearer eyJhbGci...//token de tu usuario
  Content-Type: application/json
Body:
  {
    "rating": 4,
    "comment": "Excelente servicio y comida casera",
    "images": [
      "https://ejemplo.com/review1.jpg"
    ]
  }
```

### 4. Editar Usuario (como admin)
**Request**:
```json
PUT http://localhost:3000/api/users/profile
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...//token de tu usuario
Body:
{
  "profile": {
    "name": "Nuevo Nombre",
    "avatar": "https://nueva-url.com/avatar.jpg"
  },
  "auth": {
    "password": "nueva-contraseña-segura"  // Opcional
  }
}
```

**Response**:
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0",
  "auth": {
    "email": "usuario@ejemplo.com",
    "roles": ["user"]
  },
  "profile": {
    "name": "Nuevo Nombre",
    "avatar": "https://nueva-url.com/avatar.jpg"
  },
  "metadata": {
    "created_at": "2023-12-15T10:00:00.000Z",
    "last_login": "2024-01-20T15:30:00.000Z",
    "active": true
  }
}
```

### 5. Eliminar Restaurante (como admin)
**Request**:
```json
DELETE http://localhost:3000/api/restaurants/ID_Restaurant
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...//token de tu usuario
```

### 6. Actualizar Restaurante (como admin)
**Request**:
```json
PUT http://localhost:3000/api/restaurants/ID_Restaurant
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...//token de tu usuario
Body:
{
  "name": "Nuevo Nombre del Restaurante",
  "images": "https://ejemplo.com/nueva-imagen.jpg",
  "location": "Nueva Dirección",
  "contact": {
    "phone": "Nuevo Teléfono",
    "email": "nuevo@email.com",
    "website": "https://url-actualizada.com"
  },
  "tags": ["nuevo", "tag"]
}
```

**Response**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0",
  "name": "Nuevo Nombre del Restaurante",
  "images": "https://ejemplo.com/nueva-imagen.jpg",
  "rating": {
    "average": 4.5,
    "count": 120
  },
  "location": "Nueva Dirección",
  "contact": {
    "phone": "Nuevo Teléfono",
    "email": "nuevo@email.com",
    "website": "https://url-actualizada.com"
  },
  "tags": ["nuevo", "tag"],
  "created_at": "2023-12-15T10:00:00.000Z",
  "updated_at": "2024-01-25T14:32:10.000Z"
}
```

### 7. Eliminar Review (como admin)
**Request**:
```json
POST http://localhost:3000/api/reviews/ID_Review
Headers:
  Authorization: Bearer eyJhbGci...//token de tu usuario
```

### 8. Actualizar Review (como admin)
**Request**:
```json
PUT http://localhost:3000/api/reviews/ID_Review
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGci...//token de tu usuario
Body:
{
  "rating": 4,
  "comment": "Texto actualizado de la reseña",
  "images": [
    "https://nueva-url.com/imagen1.jpg",
    "https://nueva-url.com/imagen2.jpg"
  ]
}
```

**Response**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0",
  "restaurant_id": "65b2c3d4e5f6g7h8i9j0k1",
  "user_id": "65c3d4e5f6g7h8i9j0k1l2",
  "rating": 4,
  "comment": "Texto actualizado de la reseña",
  "images": [
    "https://nueva-url.com/imagen1.jpg",
    "https://nueva-url.com/imagen2.jpg"
  ],
  "date": "2024-01-20T15:30:00.000Z"
}
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb://localhost:27017/restaurant_db
JWT_SECRET=mi_super_secreto_jwt
PORT=3000
```

## Instalación

1. Clonar repositorio:
```bash
git clone https://github.com/SebMaldon/restaurant-api.git
cd restaurant-api
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor:
```bash
npm run dev  # Modo desarrollo (con nodemon)
# o
npm start   # Modo producción
```

4. Acceder a:
```
http://localhost:3000
```

# Otras recomendaciones

## Configuración de Insomnia

Para probar la API, sigue estos pasos en Insomnia:

1. **Crea un nuevo entorno**:
   - Variables:
     - `base_url`: `http://localhost:3000/api`
     - `token`: (se actualizará al hacer login)

2. **Colección de peticiones**:
   Organiza las peticiones en carpetas por entidad (Users, Restaurants, Reviews)

### Ejemplo completo: Flujo de autenticación + operaciones

1. **Registro de usuario**:
   ```json
   POST {{base_url}}/users/register
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "Test1234",
     "name": "Usuario Test"
   }
   ```
   - Guarda el token en la variable de entorno: `Right Click > Set Environment Variable`

2. **Login** (alternativo):
   ```json
   POST {{base_url}}/users/login
   Body:
   {
     "email": "test@example.com",
     "password": "Test1234"
   }
   ```

3. **Obtener perfil**:
   ```json
   GET {{base_url}}/users/profile
   Headers:
     Authorization: Bearer {{token}}
   ```

### Ejemplo avanzado: Restaurante + Reseña

1. **Crear restaurante** (como admin):
   - Primero actualiza un usuario a admin en MongoDB:
   ```javascript
   db.users.updateOne(
     { "auth.email": "test@example.com" },
     { $set: { "auth.roles": ["admin"] } }
   )
   ```
   - Luego:
   ```json
   POST {{base_url}}/restaurants
   Headers:
     Authorization: Bearer {{token}}
   Body:
     {
       "name": "El Gourmet",
       "images": "https://example.com/gourmet.jpg",
       "location": "Calle Foodie 456",
       "tags": ["gourmet", "fino"]
     }
   ```
   - Guarda el `_id` del restaurante como variable `restaurant_id`

2. **Crear reseña**:
   ```json
   POST {{base_url}}/reviews/restaurant/{{restaurant_id}}
   Headers:
     Authorization: Bearer {{token}}
   Body:
     {
       "rating": 5,
       "comment": "Experiencia excepcional",
       "images": []
     }
   ```

## Roles y Permisos

| Rol    | Permisos                                  |
|--------|-------------------------------------------|
| user   | Gestionar su perfil, crear/modificar sus reseñas |
| admin  | Todas las operaciones + gestión de restaurantes |

## Manejo de Errores

La API devuelve códigos estándar HTTP:

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado
- `400 Bad Request`: Validación fallida
- `401 Unauthorized`: Autenticación requerida/fallida
- `403 Forbidden`: Permisos insuficientes
- `404 Not Found`: Recurso no existe
- `500 Server Error`: Error interno

Ejemplo de error:
```json
{
  "message": "Validation failed",
  "details": {
    "rating": {
      "message": "Rating must be between 1 and 5",
      "value": 6
    }
  }
}
```
