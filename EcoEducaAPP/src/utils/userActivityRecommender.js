const STORAGE_KEY = "ecoeduca_actividad_usuario";

export function registrarActividadUsuario(seccion) {
  if (!seccion) return;

  try {
    if (typeof window === "undefined" || !window.localStorage) return;

    const almacenado = window.localStorage.getItem(STORAGE_KEY);
    let actividad = {};

    if (almacenado) {
      try {
        actividad = JSON.parse(almacenado) || {};
      } catch (e) {
        // Si el JSON está corrupto, se reinicia el registro
        actividad = {};
      }
    }

    const actual = Number(actividad[seccion] || 0);
    actividad[seccion] = actual + 1;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actividad));
  } catch (e) {

  }
}

/**
 * Obtiene el top N de actividades más frecuentes del usuario.
 * Devuelve un arreglo ordenado de mayor a menor interacción.
 * @param {number} limite - Número máximo de actividades a devolver (por defecto 3)
 * @returns {{ seccion: string, conteo: number }[]} Lista de actividades
 */
export function obtenerTopActividadesUsuario(limite = 3) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];

    const almacenado = window.localStorage.getItem(STORAGE_KEY);
    if (!almacenado) return [];

    let actividad = {};
    try {
      actividad = JSON.parse(almacenado) || {};
    } catch (e) {
      return [];
    }

    const entradas = Object.entries(actividad);
    if (!entradas.length) return [];

    const ordenado = entradas
      .map(([seccion, conteo]) => ({ seccion, conteo: Number(conteo) || 0 }))
      .sort((a, b) => b.conteo - a.conteo)
      .slice(0, limite);

    return ordenado;
  } catch (e) {
    return [];
  }
}

/**
 * Limpia todo el historial de actividad almacenado.
 * Útil al cerrar sesión o para depurar.
 */
export function limpiarActividadUsuario() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
  }
}
