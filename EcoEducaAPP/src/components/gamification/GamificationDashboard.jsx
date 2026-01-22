import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Target } from "lucide-react";
import MisionesDiarias from "./MisionesDiarias";
import Leaderboard from "./Leaderboard";

const GamificationDashboard = ({ user }) => {
  const [tabActiva, setTabActiva] = useState("resumen");
  const [puntosUsuario, setPuntosUsuario] = useState(user?.puntuacion || 0);

  // Obtener puntos del usuario desde la API
  useEffect(() => {
    if (user?.id) {
      const cargarPuntos = async () => {
        try {
          const res = await fetch(`http://localhost:3001/api/usuarios/${user.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await res.json();
          if (data.puntuacion !== undefined) {
            setPuntosUsuario(data.puntuacion);
          }
        } catch (error) {
          console.error("Error al cargar puntos:", error);
          setPuntosUsuario(user?.puntuacion || 0);
        }
      };
      cargarPuntos();
    }
  }, [user]);

  // ...existing code...
  // ...existing code...

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
      component: <div style={{padding: '2rem', textAlign: 'center', color: '#888'}}>Aquí se mostrará el tablero</div>,
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
                onClick={() => setTabActiva(tab.id)}
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
          {tabs.find((tab) => tab.id === tabActiva)?.component}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
