import { MISIONES_TEMPORADA } from "./misionesTemporadaConfig";

const STORAGE_ACTIVIDAD_KEY = "ecoeduca_actividad_usuario";
const STORAGE_MISIONES_TEMP_KEY = "ecoeduca_misiones_temporada";
const STORAGE_MISIONES_DIARIAS_PREFIX = "misiones_diarias";

function getCurrentSeasonKey(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`; 
}

function getUserKey(user) {
  return user && user.id ? `u${user.id}` : "anon";
}

function leerActividadUsuario() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(STORAGE_ACTIVIDAD_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function leerEstadoMisionesTemporada(user) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(STORAGE_MISIONES_TEMP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) || {};
    const userKey = getUserKey(user);
    const userState = parsed[userKey];
    if (!userState || typeof userState !== "object") return {};

    const currentSeason = getCurrentSeasonKey(new Date());
    const storedSeason = userState.__seasonKey;

    if (storedSeason && storedSeason !== currentSeason) {
      return {};
    }

    return userState;
  } catch {
    return {};
  }
}

function leerProgresoMisionesDiarias(user) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return { puntosTotales: 0 };
    const baseKey = user && user.id ? `${STORAGE_MISIONES_DIARIAS_PREFIX}_${user.id}` : STORAGE_MISIONES_DIARIAS_PREFIX;
    const raw = window.localStorage.getItem(baseKey);
    if (!raw) return { puntosTotales: 0 };
    const parsed = JSON.parse(raw) || {};
    const puntosTotales = Number(parsed.puntos_totales || 0);
    return { puntosTotales };
  } catch {
    return { puntosTotales: 0 };
  }
}

function guardarEstadoMisionesTemporada(user, estadoPorMision) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const raw = window.localStorage.getItem(STORAGE_MISIONES_TEMP_KEY);
    const globalState = raw ? JSON.parse(raw) || {} : {};
    const userKey = getUserKey(user);
    const seasonKey = getCurrentSeasonKey(new Date());
    globalState[userKey] = { ...estadoPorMision, __seasonKey: seasonKey };
    window.localStorage.setItem(STORAGE_MISIONES_TEMP_KEY, JSON.stringify(globalState));
  } catch {
  }
}

// Evalúa una misión concreta según la actividad del usuario.
// Devuelve completada, valorActual, valorObjetivo, progreso (0-100)
// y una bandera "mostrar" que indica si debe recomendarse al usuario.
export function evaluarReglaTemporada(mision, datosUsuario) {
  const actividad = datosUsuario.actividad || {};
  const progresoDiarias = datosUsuario.progresoDiarias || { puntosTotales: 0 };

  switch (mision.tipoRegla) {
    case "visitas-seccion": {
      const actual = Number(actividad[mision.seccionObjetivo] || 0);
      const objetivo = Number(mision.visitasObjetivo || 0);
      const progreso = objetivo > 0 ? Math.min(100, (actual / objetivo) * 100) : 0;
      const completada = objetivo > 0 && actual >= objetivo;
      // Como sistema experto, solo recomendamos esta misión mientras
      // el usuario no haya alcanzado el objetivo; después deja de mostrarse.
      const mostrar = !completada;
      return { completada, valorActual: actual, valorObjetivo: objetivo, progreso, mostrar };
    }

    case "refuerzo-diarias": {
      // Si el usuario no ha ganado puntos en misiones diarias, se recomienda
      // esta misión de temporada. Si ya tiene puntos, no se muestra.
      const tienePuntos = progresoDiarias.puntosTotales > 0;
      const completada = tienePuntos;
      const mostrar = !tienePuntos;
      return {
        completada,
        valorActual: progresoDiarias.puntosTotales,
        valorObjetivo: 1,
        progreso: tienePuntos ? 100 : 0,
        mostrar,
      };
    }

    default:
      return { completada: false, valorActual: 0, valorObjetivo: 0, progreso: 0, mostrar: false };
  }
}

// Calcula las misiones de temporada activas para el usuario y actualiza el estado
// persistido cuando una misión pasa a completada.
export function calcularMisionesTemporadaParaUsuario(user, fechaReferencia = new Date()) {
  const hoy = fechaReferencia instanceof Date ? fechaReferencia : new Date(fechaReferencia);
  const actividad = leerActividadUsuario();
  const progresoDiarias = leerProgresoMisionesDiarias(user);
  const estadoGuardado = leerEstadoMisionesTemporada(user);
  const nuevoEstado = { ...estadoGuardado };
  const misionesResultado = [];

  for (const mision of MISIONES_TEMPORADA) {
    const inicio = new Date(mision.fechaInicio);
    const fin = new Date(mision.fechaFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) continue;
    if (hoy < inicio || hoy > fin) continue; // fuera de temporada

    const evaluacion = evaluarReglaTemporada(mision, { actividad, progresoDiarias });
    const estadoPrevio = estadoGuardado[mision.id];

    let completada = evaluacion.completada || Boolean(estadoPrevio && estadoPrevio.completada);

    // Si la regla indica que se completó y aún no estaba marcada, persistir
    if (evaluacion.completada && !(estadoPrevio && estadoPrevio.completada)) {
      completada = true;
      nuevoEstado[mision.id] = {
        completada: true,
        fechaCompletada: hoy.toISOString(),
      };
    }

    // Solo añadimos la misión a las recomendaciones si la regla indica
    // que debe mostrarse (por ejemplo, baja actividad en esa sección).
    if (evaluacion.mostrar !== false) {
      misionesResultado.push({
        ...mision,
        completada,
        progreso: evaluacion.progreso,
        valorActual: evaluacion.valorActual,
        valorObjetivo: evaluacion.valorObjetivo,
      });
    }
  }

  if (JSON.stringify(estadoGuardado) !== JSON.stringify(nuevoEstado)) {
    guardarEstadoMisionesTemporada(user, nuevoEstado);
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ecoedu:misiones-temporada-actualizadas"));
      }
    } catch {
    }
  }

  return misionesResultado;
}

export function obtenerEstadoMisionesTemporada(user) {
  return leerEstadoMisionesTemporada(user);
}
