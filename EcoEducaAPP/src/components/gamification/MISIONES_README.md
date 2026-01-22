# Sistema de Misiones - EcoEduca

## 📋 Estructura Actual

### Componentes Implementados

#### 1. **GamificationDashboard.jsx** (Principal)
- **Propósito**: Hub central del sistema de misiones
- **Tabs Activos**:
  - `Resumen` - Muestra puntos actuales del usuario y explicación de cómo funciona
  - `Misiones` - Renderiza el componente MisionesDiarias
- **Tabs Deshabilitados** (para futura implementación):
  - Insignias (Badges)
  - Ranking (Leaderboard)
  - Nivel (Level System)

- **Funcionamiento**:
  ```javascript
  // Obtiene puntos reales del API
  GET /api/usuario/{user.id}
  Authorization: Bearer {token}
  ```
  - Fallback a `user.puntuacion` si el API no está disponible
  - Pasa `puntosActuales` a MisionesDiarias como prop

#### 2. **MisionesDiarias.jsx** (Misiones Diarias)
- **Propósito**: Mostrar la misión del día
- **Props Esperadas**:
  - `user`: Objeto usuario con id
  - `puntosActuales`: Número de puntos actuales del usuario

- **Misión Actual**:
  - Título: "Maestro de Reciclaje"
  - Descripción: "Completa el juego de residuos y obtén 100 puntos"
  - Puntos Requeridos: 100
  - Tipo: `juego-residuos`

- **Características**:
  - ✅ Barra de progreso dinámica
  - ✅ Indicador de completitud (CheckCircle cuando progreso >= 100%)
  - ✅ Animaciones con Framer Motion
  - ✅ Instrucciones claras para completar
  - ✅ Aviso de próxima misión diaria

## 🔄 Flujo de Datos

```
App.jsx (usuario autenticado)
  ↓
GamificationDashboard
  ├─ Obtiene puntos del API: GET /api/usuario/{id}
  ├─ State: puntosUsuario
  └─ Renderiza tabs
      ├─ Resumen: Muestra puntosUsuario en tarjeta grande
      └─ Misiones: Pasa puntosUsuario como puntosActuales a MisionesDiarias
          ↓
        MisionesDiarias
          ├─ Recibe puntosActuales
          ├─ Calcula progreso: (puntosActuales / 100) * 100
          └─ Muestra misión con barra de progreso
```

## 🎯 Próximos Pasos (Pendientes)

### 1. **Integración con Calendar** (Misiones Dinámicas por Día)
Actualmente: Misión hardcodeada (100 puntos de juego de residuos)
Pendiente: 
- Endpoint API: `GET /api/mision-diaria?fecha={YYYY-MM-DD}`
- Tabla DB: `misiones_diarias` con:
  ```sql
  id | fecha | titulo | descripcion | puntos_requeridos | tipo | activa
  ```

### 2. **Verificación de Misión Completada**
Actualmente: `completada = puntosActuales >= puntosRequeridos`
Pendiente:
- Verificar que misión se completó HOY (no ayer)
- Endpoint: `POST /api/mision/{id}/completar`
- Tabla DB: `usuario_misiones` con:
  ```sql
  usuario_id | mision_id | fecha_completada | puntos_ganados
  ```

### 3. **Actualización de Puntos desde Juego**
Actualmente: Puntos se leen del API (asumen que están actualizados)
Pendiente:
- Cuando usuario juega residuos, actualizar `usuario.puntuacion`
- Endpoint: `POST /api/usuario/{id}/puntos`
- Body: `{ puntos_nuevo: 150 }`

### 4. **Insignias y Sistema de Progresión** (Deferred)
Actualmente: Blank
Pendiente: 
- BadgesSystem.jsx con medales por logros
- Tabla DB: `insignias` y `usuario_insignias`

### 5. **Ranking y Sistema de Puntuación** (Deferred)
Actualmente: Blank
Pendiente:
- Leaderboard.jsx con top usuarios
- Filtros: Semanal, Mensual, Global
- Tabla DB: Ya existe, solo mostrar ranking

## 🛠️ API Endpoints Requeridos

### Endpoints Actuales (En Uso)
```
GET /api/usuario/{id}
  Headers: Authorization: Bearer {token}
  Response: { id, nombre, puntuacion, ... }
```

### Endpoints Necesarios (Próximo)
```
GET /api/mision-diaria
  Query: ?fecha=2026-01-10
  Response: { id, titulo, descripcion, puntos_requeridos, tipo }

GET /api/usuario/{id}/misiones
  Headers: Authorization: Bearer {token}
  Response: { misiones: [...], completadas_hoy: [...] }

POST /api/mision/{id}/completar
  Headers: Authorization: Bearer {token}
  Body: { fecha: "2026-01-10", puntos_ganados: 100 }
  Response: { exito: true, puntos_nuevos: 250 }

POST /api/usuario/{id}/puntos
  Headers: Authorization: Bearer {token}
  Body: { puntos_nuevo: 150 }
  Response: { puntuacion_actual: 150 }
```

## 🎮 Integración con Juego de Residuos

### Cómo se conectan:
1. Usuario navega a "Misiones"
2. Ve misión: "Obtén 100 puntos en juego de residuos"
3. Hace clic en botón "Ir al Juego" (TODO: Implementar)
4. Se abre JuegoResiduos.jsx
5. Mientras juega, gana puntos
6. Al finalizar, puntos se guardan en BD: `usuario.puntuacion += puntos_ganados`
7. GamificationDashboard recarga puntos del API
8. Barra de progreso se actualiza automáticamente
9. Si `puntos_actuales >= 100`, misión se marca como completada ✅

### Cambios Necesarios en JuegoResiduos.jsx:
```javascript
// Al finalizar el juego:
const guardarPuntos = async () => {
  const response = await fetch(`http://localhost:3001/api/usuario/${user.id}/puntos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ puntos_nuevo: usuario.puntuacion + puntosGanados })
  });
  // GamificationDashboard recargará automáticamente
};
```

## 📊 Base de Datos (Estructura Recomendada)

### Tabla: misiones_diarias
```sql
CREATE TABLE misiones_diarias (
  id SERIAL PRIMARY KEY,
  fecha DATE UNIQUE,
  titulo VARCHAR(255),
  descripcion TEXT,
  puntos_requeridos INT,
  tipo VARCHAR(50), -- 'juego-residuos', 'leer-noticias', etc.
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: usuario_misiones
```sql
CREATE TABLE usuario_misiones (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  mision_id INT REFERENCES misiones_diarias(id),
  fecha_completada DATE,
  puntos_ganados INT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, mision_id)
);
```

## 🧪 Testing

Para probar el sistema:
1. Asegúrate que el backend está corriendo en puerto 3001
2. Usuario debe estar autenticado
3. Abre la vista "Misiones" desde el navbar
4. Verifica que se muestren puntos actuales
5. Completa el juego de residuos y gana puntos
6. Recarga la página para ver la barra de progreso actualizada

## 📝 Notas Importantes

- Todos los componentes usan **Framer Motion** para animaciones suaves
- El sistema usa **Tailwind CSS** para estilos
- Autenticación requerida (JWT token en localStorage)
- Fallback automático si API no responde
- Diseño responsive para mobile y desktop
