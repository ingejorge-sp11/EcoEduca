

export const MISIONES_TEMPORADA = [
  {
    id: "T1_JUEGO_RESIDUOS",
    nombre: "Maratón de residuos",
    descripcion:
      "Visita el juego de residuos al menos 3 veces durante la temporada.",
    puntos: 80,
    temporada: "Temporada mensual EcoEduca",
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    tipoRegla: "visitas-seccion",
    seccionObjetivo: "juego-residuos",
    visitasObjetivo: 3,
  },
  {
    id: "T2_REPORTES",
    nombre: "Reportero ambiental de temporada",
    descripcion:
      "Ingresa al módulo de reportes al menos 3 veces durante la temporada.",
    puntos: 100,
    temporada: "Temporada mensual EcoEduca",
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    tipoRegla: "visitas-seccion",
    seccionObjetivo: "reportes",
    visitasObjetivo: 3,
  },
  {
    id: "T3_EVENTOS",
    nombre: "Explorador de eventos",
    descripcion:
      "Visita la sección de eventos o calendario al menos 3 veces durante la temporada.",
    puntos: 90,
    temporada: "Temporada mensual EcoEduca",
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    tipoRegla: "visitas-seccion",
    seccionObjetivo: "eventos",
    visitasObjetivo: 3,
  },
  {
    id: "T4_REFUERZO_DIARIAS",
    nombre: "Actividad diaria",
    descripcion:
      "Completa cualquier misión diaria para activar esta recompensa de temporada y empezar a sumar puntos en EcoEduca.",
    puntos: 60,
    temporada: "Temporada mensual EcoEduca",
    fechaInicio: "2026-01-01",
    fechaFin: "2026-12-31",
    tipoRegla: "refuerzo-diarias",
  },
];
