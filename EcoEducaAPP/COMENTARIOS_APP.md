# Documentación de App.jsx - EcoEduca

Este archivo contiene comentarios descriptivos en el código fuente para facilitar su comprensión.

## Estructura General del Proyecto

**App.jsx** es el componente raíz de la aplicación EcoEduca. Maneja toda la lógica principal de navegación, autenticación y gestión de datos.

---

## Componentes Documentados

### 1. **Header**
- **Función**: Barra de navegación principal
- **Características**:
  - Logo clickeable que lleva a inicio
  - Menú de navegación (desktop y mobile)
  - Botones de login/logout
  - Muestra el nombre del usuario cuando está autenticado

### 2. **Modal**
- **Función**: Ventana emergente reutilizable
- **Uso**: Para mostrar formularios de login y registro
- **Características**:
  - Se abre/cierra con `isOpen`
  - Título personalizable
  - Botón de cierre

### 3. **Notification**
- **Función**: Mostrar mensajes de éxito o error
- **Características**:
  - Estilos diferentes según el tipo (success/error)
  - Se usa en formularios

### 4. **LoginForm**
- **Función**: Formulario para iniciar sesión
- **Flujo**:
  1. Usuario ingresa código de estudiante y contraseña
  2. Envía solicitud al servidor (`/api/login`)
  3. Si es exitoso, guarda token y datos en localStorage
  4. Cierra el modal

### 5. **RegisterForm**
- **Función**: Formulario para registrar nuevos estudiantes
- **Flujo**:
  1. Usuario llena nombre, apellido, código y contraseña
  2. Envía datos al servidor (`/api/register`)
  3. Si es exitoso, redirige a login después de 2 segundos

### 6. **HeroSection**
- **Función**: Sección de bienvenida/portada

### 7. **MapaView**
- **Función**: Vista del mapa del campus
- **Estado Actual**: Placeholder (en desarrollo)

### 8. **App (Componente Principal)**
- **Función**: Gestiona toda la aplicación
- **Responsabilidades**:
  - Autenticación de usuarios
  - Carga de datos de API
  - Navegación entre vistas
  - Gestión de modales

---

## Funciones Principales de App

### `handleLoginSuccess(data)`
Se ejecuta cuando el usuario inicia sesión exitosamente
- Guarda usuario en estado
- Almacena token y usuario en localStorage
- Cierra modal

### `handleLogout()`
Limpia la sesión del usuario
- Elimina usuario del estado
- Borra datos de localStorage

### `openLoginModal()`
Abre el modal de login

### `openRegisterModal()`
Abre el modal de registro

### `closeModal()`
Cierra ambos modales

### `renderView()`
Renderiza la vista actual según la navegación
- Usa switch/case
- Valida permisos (requiere login para misiones y juego-residuos)

---

## Rutas Disponibles

| Ruta | Componente | Requiere Login |
|------|-----------|---|
| `inicio` | HeroSection + Novedades + Juegos | No |
| `eventos` | EventosView | No |
| `evento-detalles` | EventoDetallesView | No |
| `calendario` | CalendarioView | No |
| `misiones` | GamificationDashboard | Sí |
| `juego-residuos` | JuegoResiduos | Sí |
| `mapa` | MapaView | No |

---

## Ciclo de Vida (useEffect)

Se ejecuta una sola vez al cargar la aplicación:
1. Carga usuario guardado en localStorage
2. Obtiene datos iniciales de la API:
   - Novedades
   - Eventos
   - Calendario

---

## Variables de Estado

- `currentView`: Vista actual (página visible)
- `novedades`, `eventos`, `calendario`: Datos de la API
- `isLoginOpen`, `isRegisterOpen`: Control de modales
- `user`: Datos del usuario autenticado (null si no está logueado)

---

## Flujo de Autenticación

```
Usuario ingresa credenciales
         ↓
    Envía al servidor
         ↓
    ¿Es válido?
    ├─ SÍ → Guarda token + user en localStorage
    │         → Actualiza estado
    │         → Cierra modal
    │         → Usuario puede acceder a contenido protegido
    │
    └─ NO → Muestra mensaje de error
             → Usuario intenta de nuevo
```

---

## API Endpoints Usados

- `POST /api/login` - Iniciar sesión
- `POST /api/register` - Registrar usuario
- `GET /api/novedades` - Obtener noticias
- `GET /api/eventos` - Obtener eventos
- `GET /api/calendario` - Obtener calendario

---

## Notas para el Compañero

1. El archivo tiene comentarios en todas las funciones principales
2. El código sigue la estructura React con hooks (useState, useEffect)
3. Usa localStorage para persistencia de sesión
4. El acceso a algunas secciones requiere autenticación
5. El token del usuario se usa para futuras solicitudes autenticadas

