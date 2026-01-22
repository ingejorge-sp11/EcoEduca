# Módulo Eventos

## Descripción
Módulo independiente que contiene los componentes de Eventos para la aplicación EcoEduca.

## Estructura
```
eventos/
├── Eventos.jsx       # Componentes principales (EventosView, EventoDetallesView)
├── eventos.css       # Estilos CSS de eventos
├── index.js         # Exportador del módulo
└── README.md        # Este archivo
```

## Características

### EventosView
- Grid responsivo de eventos
- Tarjetas interactivas con hover effects
- Información de fecha, hora y ubicación
- Animación de hojas cayendo
- Integración con vista de detalles

### EventoDetallesView
- Vista completa del evento
- Información detallada con iconos
- Botón de registro
- Navegación de regreso fácil

## Uso
```jsx
import { EventosView, EventoDetallesView } from "./components/eventos";

// O importación individual
import { EventosView } from "./components/eventos/Eventos";
import { EventoDetallesView } from "./components/eventos/Eventos";
```

## Props

### EventosView
- `data` (Array): Array de eventos
- `onSelectEvento` (Function): Callback cuando se selecciona un evento

### EventoDetallesView
- `evento` (Object): Objeto del evento a mostrar
- `onBack` (Function): Callback para volver atrás

## Estructura de Datos
```js
{
  id: string,
  title: string,
  date: string (YYYY-MM-DD),
  time: string,
  location: string,
  description: string
}
```

## Optimización para Producción
Este módulo está diseñado para:
- Separación de responsabilidades

- Mejorar mantenibilidad
- Permitir caching independiente
- Reutilización de componentes
