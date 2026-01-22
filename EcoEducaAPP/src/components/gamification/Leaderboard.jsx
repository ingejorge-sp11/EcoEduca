import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
import { Trophy, Medal, Flame } from "lucide-react";

const Leaderboard = ({ user }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopUsuarios = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/usuarios/top");
        if (!res.ok) throw new Error("No se pudo conectar con el servidor");
        const data = await res.json();
        setUsuarios(data);
        // Buscar si el usuario actual está en el top
        const actual = data.find(u => u.id === user?.id);
        setUsuarioActual(actual || null);
      } catch (err) {
        setError("No se pudo cargar el ranking. Verifica la conexión con la API.");
      } finally {
        setLoading(false);
      }
    };
    fetchTopUsuarios();
  }, [user]);

  const getMedalIcon = (posicion) => {
    if (posicion === 1) return "🥇";
    if (posicion === 2) return "🥈";
    if (posicion === 3) return "🥉";
    return null;
  };
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-500" size={32} />
          Tabla de Posiciones
        </h2>
        {loading ? (
          <p>Cargando ranking...</p>
        ) : error ? (
          <p className="text-red-500 font-bold">{error}</p>
        ) : usuarios.length === 0 ? (
          <p>No hay datos de ranking disponibles.</p>
        ) : (
          <>
            {/* Ranking Top 10 */}
            <div className="space-y-2">
              {usuarios.map((entrada, index) => (
                <div
                  key={entrada.id}
                  className={`p-4 rounded-lg transition-all border-2 ${
                    entrada.id === user?.id
                      ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-400 shadow-lg"
                      : index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-white border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Posición */}
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
                      {getMedalIcon(index + 1) ? (
                        <span className="text-3xl">{getMedalIcon(index + 1)}</span>
                      ) : (
                        <span className="text-xl font-bold text-gray-600">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    {/* Nombre */}
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800">{entrada.nombre}</p>
                    </div>
                    {/* Puntos */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-black text-green-600">
                        {entrada.puntuacion.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">puntos</p>
                    </div>
                  </div>
                  {/* Barra de progreso relativa */}
                  <div className="mt-3 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      style={{ width: `${(entrada.puntuacion / usuarios[0].puntuacion) * 100}%` }}
                      className={`h-full ${
                        entrada.id === user?.id
                          ? "bg-gradient-to-r from-green-400 to-blue-500"
                          : index < 3
                          ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                          : "bg-gray-400"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* Si el usuario no está en el top 10, mostrar su posición */}
            {!usuarioActual && user?.id && (
              <div className="mt-8 flex flex-col items-center">
                <span className="text-2xl">⬇️</span>
                <p className="font-bold text-gray-800 mt-2">Tu posición actual</p>
                {/* Aquí podrías hacer una petición para obtener la posición real del usuario si lo deseas */}
              </div>
            )}
          </>
        )}
      </div>
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center text-sm text-gray-700">
        <p className="mb-2 font-semibold">💡 Consejo</p>
        <p>
          Completa misiones diarias y desbloquea insignias para escalar en la tabla de posiciones
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
