import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Circle, Target } from "lucide-react";
import { calcularMisionesTemporadaParaUsuario } from "../../utils/misionesTemporadaRules";

const MisionesTemporada = ({ user }) => {
  const [misiones, setMisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(
    new Date().toLocaleDateString("es-ES")
  );

  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy.toLocaleDateString("es-ES"));

    const recargar = () => {
      const calculadas = calcularMisionesTemporadaParaUsuario(user, new Date());
      setMisiones(calculadas);
      setLoading(false);
    };

    recargar();

    // Escuchar actualizaciones de misiones de temporada
    const handler = () => recargar();
    if (typeof window !== "undefined") {
      window.addEventListener("ecoedu:misiones-temporada-actualizadas", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("ecoedu:misiones-temporada-actualizadas", handler);
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-600">Cargando misiones de temporada…</div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="text-purple-600" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Misiones de temporada
            </h2>
            <p className="text-sm text-gray-600">
              Basadas en tu actividad en EcoEduca — {fechaActual}
            </p>
          </div>
        </div>
        {misiones.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={16} className="text-gray-500" />
            <span>Temporadas activas: {misiones[0].temporada}</span>
          </div>
        )}
      </div>

      {misiones.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          Por el momento no hay misiones de temporada activas.
        </div>
      ) : (
        <div className="grid gap-6">
          {misiones.map((mision) => (
            <motion.div
              key={mision.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border-2 transition-all ${
                mision.completada
                  ? "bg-purple-50 border-purple-400"
                  : "bg-white border-gray-300 hover:border-purple-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100">
                  <span className="text-3xl">🎯</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">
                        {mision.nombre}
                      </h3>
                      <p className="text-gray-600 mt-1">{mision.descripcion}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Temporada: {mision.temporada} ({mision.fechaInicio} 
                        al {mision.fechaFin})
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {mision.completada ? (
                        <CheckCircle2
                          size={32}
                          className="text-purple-500"
                          fill="currentColor"
                        />
                      ) : (
                        <Circle
                          size={32}
                          className="text-gray-300"
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso simple basada en visitas */}
                  {typeof mision.progreso === "number" && mision.progreso > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          Progreso: {Math.round(mision.progreso)}%
                        </span>
                        {mision.valorObjetivo > 0 && (
                          <span>
                            {mision.valorActual || 0} / {mision.valorObjetivo} visitas
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            mision.completada
                              ? "bg-purple-500"
                              : "bg-purple-300"
                          }`}
                          style={{ width: `${Math.min(mision.progreso, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    {mision.completada ? (
                      <div className="flex items-center gap-2 p-3 bg-purple-100 border border-purple-400 rounded-lg text-purple-700 font-semibold text-sm">
                        <CheckCircle2 size={20} />
                        ¡Misión de temporada completada! Ganaste +{mision.puntos} puntos virtuales.
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-300 rounded-lg text-indigo-700 font-semibold text-sm">
                        <Target size={20} />
                        Sigue usando EcoEduca para completar esta misión y obtener +{mision.puntos} puntos.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisionesTemporada;
