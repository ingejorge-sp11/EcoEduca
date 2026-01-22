# Módulo Calendario

## Descripción
Módulo independiente que contiene el componente de Calendario para la aplicación EcoEduca.

## Estructura
```
calendario/
├── Calendario.jsx       # Componente principal (550 líneas)
├── calendario.css       # Estilos CSS del calendario
├── index.js            # Exportador del módulo
└── README.md           # Este archivo
```

## Características
- Vista de Mes, Semana y Día
- Eventos filtrados por fecha
- Animaciones suaves
- Respaldo para dispositivos móviles
- Simbología de colores para tipos de eventos:
  - 🟨 Día actual (amarillo)
  - 🟢 Actividades/Talleres ambientales (verde)
  - 🔴 Días Festivos (rojo)
  - 🔵 Fechas importantes (azul)

## Uso
```jsx
import CalendarioView from "./components/calendario/Calendario";

// O usando el index.js
import CalendarioView from "./components/calendario";

// En el componente
<CalendarioView data={calendarioData} />
```

## Props
- `data` (Array): Array de objetos con eventos. Cada evento debe tener:
  - `id`: Identificador único
  - `title`: Título del evento
  - `date`: Fecha en formato YYYY-MM-DD
  - `time`: Hora del evento
  - `location`: Ubicación del evento
  - `description`: Descripción del evento
  - `type`: Tipo de evento (ambiental, festivo, nacional, importante, evento)

## Optimización para Producción
Este módulo está diseñado como un componente separado para:

- Mejorar la performance inicial de la aplicación
- Separación de responsabilidades
- Facilitar el mantenimiento y pruebas
- Permitir caching independiente

## Nota de Compatibilidad
El código del componente permanece exactamente igual al original, solo se ha modularizado para mejorar la estructura del proyecto.
