import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Target } from "lucide-react";
import MisionesDiarias from "./MisionesDiarias";
import Leaderboard from "./Leaderboard";
import { obtenerTopActividadesUsuario } from "../../utils/userActivityRecommender";

const GamificationDashboard = ({ user }) => {
  const [tabActiva, setTabActiva] = useState("resumen");
  const [puntosUsuario, setPuntosUsuario] = useState(0);

  // Obtener puntos acumulados solo desde las misiones (localStorage)
  useEffect(() => {
    const actualizarPuntos = () => {
      try {
        if (typeof window === "undefined" || !window.localStorage) {
          setPuntosUsuario(0);
          return;
        }
        const key = user && user.id ? `misiones_diarias_${user.id}` : "misiones_diarias";
        const progreso = JSON.parse(window.localStorage.getItem(key)) || {};
        setPuntosUsuario(Number(progreso.puntos_totales || 0));
      } catch (e) {
        setPuntosUsuario(0);
      }
    };

    actualizarPuntos();

    const handler = () => actualizarPuntos();
    if (typeof window !== "undefined") {
      window.addEventListener("ecoedu:puntos-misiones-actualizados", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ecoedu:puntos-misiones-actualizados", handler);
      }
    };
  }, [user]);

  const topActividades = obtenerTopActividadesUsuario(3);
  const nombresAmigables = {
    "juego-residuos": "Juego de residuos",
    "juego-reciclaje-animado": "Juego de reciclaje",
    "mapa": "Mapa",
    "calendario": "Calendario",
    "eventos": "Eventos",
    "reportes": "Reportes",
  };
  const descripcionesActividad = {
    "juego-residuos": "Juego de reciclaje: acumula puntos para cumplir misiones.",
    "juego-reciclaje-animado": "Juego de reciclaje: acumula puntos para cumplir misiones.",
    "eventos": "Conoce más acerca de eventos de CUCEI para el medio ambiente.",
    "calendario": "Explora días festivos o eventos importantes.",
    "mapa": "Conoce incidentes de tu alrededor.",
    "reportes": "Reporta incidentes que ayuden a la comunidad.",
  };

  const irASeccion = (seccion) => {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ecoedu:navigate", { detail: seccion }));
      }
    } catch (e) {
      
    }
  };

  const tabs = [
    {
      id: "resumen",
      nombre: "Resumen",
      icono: <Zap size={20} />,
      component: null,
    },
    {
      id: "misiones",
      nombre: "Misiones",
      icono: <Target size={20} />,
      component: <MisionesDiarias user={user} puntosActuales={puntosUsuario} />,
    },
    {
      id: "tablero",
      nombre: "Tablero",
      icono: <span role="img" aria-label="tablero">🏆</span>,
      component: <Leaderboard user={user} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2">
            Misiones diarias
          </h1>
          <p className="text-gray-600 text-lg">
            Completa misiones diarias y gana puntos
          </p>
        </motion.div>

        {/* RESUMEN - Solo puntos */}
        {tabActiva === "resumen" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tarjeta de Puntos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-8 border-2 border-yellow-300 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-5xl">⭐</span>
                  <Zap className="text-yellow-600" size={32} />
                </div>
                <p className="text-sm text-gray-700 font-medium mb-2">
                  Tus Puntos Actuales
                </p>
                <p className="text-6xl font-black text-yellow-600">
                  {puntosUsuario}
                </p>
                <p className="text-xs text-gray-600 mt-4">
                  Puntos ganados completando misiones
                </p>
              </motion.div>

              {/* Información */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg p-8 shadow-lg border-2 border-gray-100"
              >
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  📋 Cómo Funciona
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-xl">✅</span>
                    <span>
                      <strong>Cada día</strong> hay una misión distinta
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🎮</span>
                    <span>
                      <strong>Juega</strong> el juego de residuos
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">🏆</span>
                    <span>
                      <strong>Alcanza los puntos</strong> requeridos
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-xl">⭐</span>
                    <span>
                      <strong>Completa la misión</strong> y obtén recompensas
                    </span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b-2 border-gray-300 pb-0">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setTabActiva(tab.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold transition-all whitespace-nowrap ${
                  tabActiva === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.icono}
                {tab.nombre}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Contenido de tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-lg"
        >
          {tabActiva === "resumen" ? (
            topActividades.length > 0 ? (
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                  Basado en tus interacciones, esto podría interesarte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topActividades.map((actividad, index) => {
                    const nombre = nombresAmigables[actividad.seccion] || actividad.seccion;
                    const descripcion = descripcionesActividad[actividad.seccion] || "Explora esta sección para seguir participando.";
                    return (
                      <motion.button
                        key={actividad.seccion + index}
                        onClick={() => irASeccion(actividad.seccion)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full h-32 text-left overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-sky-100 border border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between p-4 group"
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-gradient-to-br from-emerald-100/40 to-transparent" />
                        <div className="relative z-10 flex flex-col h-full justify-between">
                          <div className="flex items-center gap-3 mb-1">
                            <motion.span
                              className="text-3xl"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            >
                              🌍
                            </motion.span>
                            <span className="block text-base font-bold text-gray-900 leading-snug">{nombre}</span>
                          </div>
                          <span className="text-xs text-gray-700">
                            {descripcion}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Aún no tenemos suficientes datos de tu comportamiento para mostrar recomendaciones.
              </p>
            )
          ) : (
            tabs.find((tab) => tab.id === tabActiva)?.component
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
