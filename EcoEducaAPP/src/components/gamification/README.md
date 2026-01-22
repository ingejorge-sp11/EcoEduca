# 🎮 Sistema de Gamificación - EcoEduca

## Descripción
Sistema completo de gamificación que incluye:

- **📋 Misiones Diarias**: Tareas con progreso y recompensas
- **⭐ Insignias/Badges**: Logros desbloqueables con diferentes rarezas
- **🏆 Leaderboard**: Tabla de posiciones global, mensual y semanal
- **📊 Dashboard**: Panel de control con estadísticas del usuario

## Componentes Creados

### 1. **GamificationDashboard.jsx** (Componente Principal)
- Dashboard principal con tabs para navegar
- Muestra estadísticas rápidas del usuario
- Integra todos los sub-componentes

### 2. **MisionesDiarias.jsx**
- Muestra misiones diarias con progreso visual
- Cada misión tiene:
  - Título y descripción
  - Barra de progreso
  - Puntos asociados
  - Icono representativo

### 3. **BadgesSystem.jsx**
- Sistema de insignias con rarezas (Común, Raro, Épico, Legendario)
- Badges desbloqueados con efecto brillo
- Badges bloqueados con progreso hacia su desbloqueamiento
- Sección de próximos badges a desbloquear

### 4. **Leaderboard.jsx**
- Tabla de posiciones con 3 vistas: Semanal, Mensual, Global
- Muestra racha de días consecutivos
- Medalas para los top 3 (🥇🥈🥉)
- Destaca la posición del usuario actual

## Cómo Usar

### Integración en App.jsx
Ya está integrado. Solo necesitas:

1. El usuario debe estar logueado para acceder
2. Navega a "Gamificación" desde el menú principal
3. Explora las diferentes pestañas

### Conectar con tu API Backend

#### Endpoints sugeridos para crear en tu backend:

```javascript
// Misiones
GET  /api/misiones-diarias      // Obtener misiones del día
POST /api/misiones/:id/completar // Completar una misión
GET  /api/usuario/:id/misiones   // Obtener misiones del usuario

// Badges/Insignias
GET  /api/badges                 // Obtener todos los badges
GET  /api/usuario/:id/badges     // Obtener badges del usuario

// Leaderboard
GET  /api/leaderboard?tipo=semanal|mensual|global
GET  /api/usuario/:id/ranking    // Obtener posición del usuario

// Estadísticas
GET  /api/usuario/:id/stats      // Puntos, racha, nivel, etc.
POST /api/usuario/:id/ganar-puntos
```

## Datos Simulados

Actualmente usa datos simulados en los componentes. Para conectar con tu API:

1. Reemplaza los `useState` iniciales con llamadas a `fetch`
2. Usa `useEffect` para cargar datos
3. Ejemplo:

```javascript
useEffect(() => {
  const cargarMisiones = async () => {
    const res = await fetch(`${API_URL}/misiones-diarias`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setMisiones(data);
  };
  cargarMisiones();
}, []);
```

## Estructura de Datos

### Misión
```javascript
{
  id: number,
  titulo: string,
  descripcion: string,
  puntos: number,
  progreso: number,
  total: number,
  completada: boolean,
  icono: string
}
```

### Badge/Insignia
```javascript
{
  id: number,
  nombre: string,
  descripcion: string,
  icono: string,
  desbloqueado: boolean,
  progreso: number,
  total: number,
  rareza: 'común' | 'raro' | 'épico' | 'legendario',
  puntos: number
}
```

### Entrada Leaderboard
```javascript
{
  id: number,
  nombre: string,
  puntos: number,
  racha: number,  // días consecutivos
  posicion: number
}
```

### Stats Usuario
```javascript
{
  puntosActuales: number,
  racha: number,
  nivel: number,
  proximoNivel: number,
  insigniasDesbloqueadas: number,
  totalInsignias: number,
  posicionGlobal: number
}
```

## Características Visuales

✨ **Animaciones**
- Entrada suave de elementos
- Progreso animado
- Efectos de hover
- Transiciones de tabs

🎨 **Gradientes y Colores**
- Amarillo: Puntos
- Naranja: Racha
- Verde: Nivel
- Púrpura: Posición

📱 **Responsive**
- Funciona en móvil y desktop
- Grid adaptable
- Textos escalables

## Próximas Mejoras

- [ ] Conectar con API backend real
- [ ] Agregar notificaciones al desbloquear badges
- [ ] Sistema de logros históricos
- [ ] Competencias entre grupos/cursos
- [ ] Premios reales asociados a puntos
- [ ] Exportar historial de gamificación

## Archivos

```
src/components/gamification/
├── GamificationDashboard.jsx    (Principal)
├── MisionesDiarias.jsx
├── BadgesSystem.jsx
└── Leaderboard.jsx
```

---

**Creado**: Enero 2026  
**Versión**: 1.0  
**Estado**: Funcional con datos simulados
