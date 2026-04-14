import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const Leaderboard = ({ user }) => {
  const [usuarios, setUsuarios] = useState([]); // top 6
  const [loading, setLoading] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState(null); 
  const [posicionActual, setPosicionActual] = useState(null); 
  const [detalleUsuario, setDetalleUsuario] = useState(null); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("/api/v1/leaderboard/top6", {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error("No se pudo conectar con el servidor");
        const data = await res.json();
        const top = Array.isArray(data.top) ? data.top : [];
        setUsuarios(top);
        const actual = top.find(u => u.id === user?.id) || null;
        setUsuarioActual(actual);
        setPosicionActual(data.currentUser?.rank ?? null);
        setDetalleUsuario(data.currentUser || null);
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
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={24} />
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
            <div className="space-y-1">
              {usuarios.map((entrada, index) => (
                <div
                  key={entrada.id}
                  className={`p-3 rounded-md transition-all border ${
                    entrada.id === user?.id
                      ? "bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow"
                      : index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                      : "bg-white border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10">
                      {getMedalIcon(index + 1) ? (
                        <span className="text-2xl">{getMedalIcon(index + 1)}</span>
                      ) : (
                        <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">{entrada.nombre}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xl font-black text-green-600">
                        {(entrada.total ?? (entrada.puntuacion + (entrada.puntuacion_segundo || 0))).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-1 overflow-hidden">
                    <div
                      style={{ width: `${(((entrada.total ?? (entrada.puntuacion + (entrada.puntuacion_segundo || 0))) / (usuarios[0].total ?? (usuarios[0].puntuacion + (usuarios[0].puntuacion_segundo || 0)))) * 100)}%` }}
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
            {!usuarioActual && user?.id && posicionActual && (
              <div className="mt-6 flex flex-col items-center">
                <span className="text-2xl">⬇️</span>
                <p className="font-bold text-gray-800 mt-2">Tu posición actual</p>
                <div className="mt-3 p-3 rounded-md transition-all border bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow w-full max-w-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12">
                      <span className="text-lg font-bold text-gray-600">#{posicionActual}</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">{detalleUsuario?.nombre || user?.nombre || "Tu usuario"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xl font-black text-green-600">
                        {Number(detalleUsuario?.total || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
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
