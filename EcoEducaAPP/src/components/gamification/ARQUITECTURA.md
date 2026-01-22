# 🏗️ Arquitectura del Sistema de Misiones

## Estructura de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      App.jsx                                │
│  (Renderiza GamificationDashboard cuando view='misiones')   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  GamificationDashboard.jsx           │
        │  ├─ State: tabActiva, puntosUsuario │
        │  ├─ useEffect: Fetch /api/usuario/:id
        │  └─ Renderiza Tabs                   │
        └──────────────┬───────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    ┌────────────┐            ┌─────────────────┐
    │  Resumen   │            │  Misiones       │
    │            │            │                 │
    │ - Puntos   │            │ MisionesDiarias │
    │   grandes  │            │ - Barra progr. │
    │ - Info HoW │            │ - Instrucciones │
    └────────────┘            └─────────────────┘
```

## Flujo de Datos (Data Flow)

```
Usuario Autenticado
        │
        ▼
    App.jsx
    (view === 'misiones')
        │
        ▼
GamificationDashboard
    │
    ├─ useEffect (al montar)
    │  ├─ Obtiene user.id
    │  └─ GET /api/usuario/{id}
    │     ├─ Si OK: setPuntosUsuario(data.puntuacion)
    │     └─ Si Error: setPuntosUsuario(user.puntuacion)
    │
    └─ Renderiza MisionesDiarias
       ├─ Props: { user, puntosActuales: puntosUsuario }
       └─ Actualización automática cuando puntosUsuario cambia
```

## Estados y Props

### GamificationDashboard
```javascript
State:
  - tabActiva: 'resumen' | 'misiones' | 'insignias' | 'ranking' | 'nivel'
  - puntosUsuario: number (0-∞)

Props:
  - user: { id, nombre, puntuacion, ... }
```

### MisionesDiarias
```javascript
Props:
  - user: { id, nombre, ... }
  - puntosActuales: number

State:
  - misiones: [{ id, titulo, descripcion, puntosRequeridos, ... }]
  - loading: boolean

Computed:
  - progreso: (puntosActuales / puntosRequeridos) * 100
  - completada: puntosActuales >= puntosRequeridos
```

## Ciclo de Vida - Usuario Completa Misión

```
1. INICIO
   ├─ Usuario abre "Misiones"
   ├─ GamificationDashboard monta
   └─ Fetch de puntos (GET /api/usuario/{id})

2. PRIMER RENDER
   ├─ Se muestran puntos actuales: 0
   ├─ Se muestra misión: "100 puntos requeridos"
   ├─ Barra de progreso: 0%
   └─ Estado: "Obtén 100 puntos más"

3. USUARIO JUEGA
   ├─ Abre JuegoResiduos
   ├─ Gana 50 puntos
   ├─ Juego hace POST /api/usuario/{id}/puntos { 50 }
   └─ Backend actualiza: usuario.puntuacion = 50

4. RECARGA DE PUNTOS (manual o auto)
   ├─ GamificationDashboard refetch
   ├─ GET /api/usuario/{id} → puntuacion: 50
   ├─ MisionesDiarias recibe puntosActuales: 50
   └─ Barra de progreso: 50%

5. SEGUNDA JUGADA
   ├─ Usuario juega de nuevo
   ├─ Gana 60 puntos más
   ├─ Juego hace POST → usuario.puntuacion = 110
   └─ Recarga de puntos

6. MISIÓN COMPLETADA ✅
   ├─ GamificationDashboard fetch: puntuacion: 110
   ├─ MisionesDiarias: 110 >= 100 → completada = true
   ├─ Barra de progreso: 100%
   ├─ Mensaje: "¡Misión Completada! +100 puntos"
   └─ Animación de CheckCircle
```

## Flujo de Actualización en Tiempo Real (Posible)

```
Para que sea en TIEMPO REAL (sin refrescar):
1. Agregar WebSocket en JuegoResiduos
2. Cuando usuario gana puntos:
   io.emit('puntos-ganados', { puntos: 50 })
3. GamificationDashboard escucha:
   io.on('puntos-ganados', (data) => {
     setPuntosUsuario(prev => prev + data.puntos)
   })
4. MisionesDiarias se actualiza automáticamente (re-render)
```

## Componentes Secundarios (Deferred)

```
BadgesSystem.jsx
├─ Componente creado pero no visible
├─ Mostraría 6 insignias diferentes
└─ Próximamente: Conectar con tabla insignias

Leaderboard.jsx
├─ Componente creado pero no visible
├─ Mostraría ranking de usuarios
└─ Próximamente: Conectar con tabla usuario_puntuacion
```

## URLs Navegación

```
/                    → Inicio
/calendario          → Calendario de eventos
/noticias            → Carrusel de noticias
/juego-residuos      → Juego principal
/misiones            ← Sistema de Misiones (AQUÍ)
└─ Tabs:
   ├─ Resumen
   ├─ Misiones (activo)
   ├─ Insignias (disabled)
   ├─ Ranking (disabled)
   └─ Nivel (disabled)
```

## Integración con API

```
┌─────────────────────────────────────┐
│     EcoEducaAPI (Node.js)           │
│     Puerto: 3001                    │
└────────────────┬────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌──────────────┐    ┌─────────────────┐
│ GET /usuario │    │ POST /puntos    │
│  /{id}       │    │ /{id}           │
└──────────────┘    └─────────────────┘
      │
      └─► PostgreSQL
          ├─ usuarios
          │  └─ (id, nombre, puntuacion)
          ├─ misiones_diarias
          │  └─ (id, fecha, titulo, puntos_requeridos)
          └─ usuario_misiones
             └─ (usuario_id, mision_id, fecha_completada)
```

## Seguridad

```
Todos los requests incluyen:
  Header: Authorization: Bearer {JWT_TOKEN}

Token se obtiene de:
  localStorage.getItem('token')

Verificación en servidor:
  ✓ Token válido
  ✓ Usuario autenticado
  ✓ Usuario existe en BD
  ✓ Usuario tiene permisos
```

## Performance

```
Optimizaciones implementadas:
  ✓ useEffect solo se ejecuta cuando user cambia
  ✓ Componentes memoizados con motion.div
  ✓ Animaciones suaves con Framer Motion
  ✓ Lazy loading de componentes
  ✓ Fallback a estado local si API falla
```

## Testing Checklist

```
□ Backend corriendo en puerto 3001
□ Usuario autenticado con JWT token
□ Navbar muestra "⚡ Misiones"
□ Clic en Misiones abre GamificationDashboard
□ Tab "Resumen" muestra puntos actuales
□ Tab "Misiones" muestra barra de progreso
□ Otros tabs están deshabilitados
□ Barra progresa cuando usuario gana puntos
□ Misión se marca como completada en verde
□ Animaciones son suaves
□ Responsive en móvil y desktop
```
