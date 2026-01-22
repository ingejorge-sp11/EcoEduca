import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Target, Calendar } from "lucide-react";

const MisionesDiarias = ({ user, puntosActuales }) => {
  const [misiones, setMisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date().toLocaleDateString("es-ES"));

  // Cargar misión del día desde la API
  useEffect(() => {
    const cargarMision = async () => {
      try {
        // Por ahora usamos datos simulados
        // Cuando tengas el endpoint en el backend, reemplaza esto
        const misionDelDia = {
          id: 1,
          titulo: "Maestro de Reciclaje",
          descripcion: "Completa el juego de residuos y obtén 100 puntos",
          puntosRequeridos: 100,
          puntos: 50,
          icono: "♻️",
          tipo: "juego-residuos",
          completada: puntosActuales >= 100,
          fecha: new Date().toISOString().split('T')[0],
        };
        
        setMisiones([misionDelDia]);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar misión:", error);
        setLoading(false);
      }
    };

    cargarMision();
  }, [puntosActuales]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin">⏳</div>
        <p className="text-gray-600 mt-2">Cargando misión del día...</p>
      </div>
    );
  }

  const misionDelDia = misiones[0];
  const progreso = Math.min((puntosActuales / misionDelDia.puntosRequeridos) * 100, 100);

  return (
    <div className="w-full">
      {/* Header con fecha */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-green-600" size={28} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Misión del Día</h2>
              <p className="text-sm text-gray-600">{fechaActual}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Puntos por completar</p>
            <p className="text-3xl font-bold text-yellow-600">+{misionDelDia.puntos}</p>
          </div>
        </div>
      </div>

      {/* Tarjeta de misión principal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-lg border-2 transition-all ${
          misionDelDia.completada
            ? "bg-green-50 border-green-400"
            : "bg-white border-gray-300 hover:border-green-400"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
            <span className="text-4xl">{misionDelDia.icono}</span>
          </div>

          {/* Contenido */}
          <div className="flex-grow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-xl text-gray-800">
                  {misionDelDia.titulo}
                </h3>
                <p className="text-gray-600 mt-1">{misionDelDia.descripcion}</p>
              </div>
              <div className="flex-shrink-0">
                {misionDelDia.completada ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle2
                      size={32}
                      className="text-green-500"
                      fill="currentColor"
                    />
                  </motion.div>
                ) : (
                  <Circle
                    size={32}
                    className="text-gray-300"
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progreso</span>
                <span className="text-sm font-bold text-green-600">
                  {puntosActuales} / {misionDelDia.puntosRequeridos} puntos
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progreso}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    misionDelDia.completada
                      ? "bg-gradient-to-r from-green-400 to-emerald-600"
                      : "bg-gradient-to-r from-blue-400 to-cyan-500"
                  }`}
                />
              </div>
            </div>

            {/* Estado */}
            <div className="mt-4">
              {misionDelDia.completada ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 bg-green-100 border border-green-400 rounded-lg text-green-700 font-semibold"
                >
                  <CheckCircle2 size={20} />
                  ✅ ¡Misión Completada! Ganaste +{misionDelDia.puntos} puntos
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-2 p-3 bg-blue-100 border border-blue-400 rounded-lg text-blue-700 font-semibold"
                >
                  <Zap size={20} />
                  Obtén {misionDelDia.puntosRequeridos - puntosActuales} puntos más para completar
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Instrucciones */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
      >
        <p className="text-sm text-gray-700 mb-2 font-semibold">📖 Cómo completar:</p>
        <ol className="text-sm text-gray-700 space-y-1 ml-4">
          <li>1. Ve al juego de Residuos</li>
          <li>2. Juega y obtén puntos</li>
          <li>3. Alcanza los {misionDelDia.puntosRequeridos} puntos requeridos</li>
          <li>4. ¡Misión completada automáticamente!</li>
        </ol>
      </motion.div>

      {/* Próxima misión */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg"
      >
        <p className="text-sm text-gray-700 font-semibold">
          📅 Mañana tendrás una nueva misión
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Las misiones cambian diariamente. Completa todas para ganar mas puntos
        </p>
      </motion.div>
    </div>
  );
};

export default MisionesDiarias;
