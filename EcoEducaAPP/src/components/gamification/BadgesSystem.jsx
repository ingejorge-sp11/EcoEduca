import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Star, Flame, Crown, Heart, Leaf } from "lucide-react";

const BadgesSystem = ({ user }) => {
  const [badges, setBadges] = useState([
    {
      id: 1,
      nombre: "Primeros Pasos",
      descripcion: "Completar tu primer juego",
      icono: "🚀",
      desbloqueado: true,
      progreso: 1,
      total: 1,
      rareza: "común",
      puntos: 10,
    },
    {
      id: 2,
      nombre: "Guerrero Verde",
      descripcion: "Alcanzar 100 puntos en juegos",
      icono: "💚",
      desbloqueado: true,
      progreso: 100,
      total: 100,
      rareza: "raro",
      puntos: 25,
    },
    {
      id: 3,
      nombre: "Maestro Ambiental",
      descripcion: "Alcanzar 500 puntos en juegos",
      icono: "🌍",
      desbloqueado: false,
      progreso: 250,
      total: 500,
      rareza: "épico",
      puntos: 50,
    },
    {
      id: 4,
      nombre: "Lector Ávido",
      descripcion: "Lee 10 noticias",
      icono: "📚",
      desbloqueado: false,
      progreso: 6,
      total: 10,
      rareza: "común",
      puntos: 15,
    },
    {
      id: 5,
      nombre: "Campeón de Competencias",
      descripcion: "Gana 3 competencias",
      icono: "🏆",
      desbloqueado: false,
      progreso: 1,
      total: 3,
      rareza: "legendario",
      puntos: 100,
    },
    {
      id: 6,
      nombre: "Participante Activo",
      descripcion: "Completa 7 días consecutivos",
      icono: "🔥",
      desbloqueado: false,
      progreso: 3,
      total: 7,
      rareza: "raro",
      puntos: 30,
    },
  ]);

  const getRarityColor = (rareza) => {
    const colors = {
      común: "from-gray-400 to-gray-500",
      raro: "from-blue-400 to-cyan-500",
      épico: "from-purple-500 to-pink-500",
      legendario: "from-yellow-400 to-orange-500",
    };
    return colors[rareza] || colors.común;
  };

  const getRarityLabel = (rareza) => {
    const labels = {
      común: "Común",
      raro: "Raro",
      épico: "Épico",
      legendario: "Legendario",
    };
    return labels[rareza] || rareza;
  };

  const badgesDesbloqueados = badges.filter((b) => b.desbloqueado).length;
  const puntosEnBadges = badges
    .filter((b) => b.desbloqueado)
    .reduce((sum, b) => sum + b.puntos, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateZ: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2 mb-4">
          <Star className="text-yellow-500" size={32} fill="currentColor" />
          Insignias y Logros
        </h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Desbloqueadas</p>
            <p className="text-3xl font-bold text-blue-600">
              {badgesDesbloqueados}/{badges.length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Puntos de Badges</p>
            <p className="text-3xl font-bold text-yellow-600">{puntosEnBadges}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Progreso</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((badgesDesbloqueados / badges.length) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Grid de badges */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
      >
        {badges.map((badge) => (
          <motion.div
            key={badge.id}
            variants={itemVariants}
            className="relative group"
          >
            <div
              className={`p-4 rounded-lg text-center transition-all ${
                badge.desbloqueado
                  ? `bg-gradient-to-br ${getRarityColor(badge.rareza)} shadow-lg`
                  : "bg-gray-100 opacity-60"
              }`}
            >
              {/* Efecto brillo en desbloqueados */}
              {badge.desbloqueado && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-lg bg-white opacity-10"
                />
              )}

              {/* Icono del badge */}
              <div className="relative z-10">
                <div className="text-4xl mb-2 mx-auto">{badge.icono}</div>
                <h3 className="font-bold text-white text-sm mb-1 line-clamp-2">
                  {badge.nombre}
                </h3>

                {/* Rareza label */}
                {badge.desbloqueado && (
                  <div className="text-xs text-white/80 font-semibold mb-2">
                    {getRarityLabel(badge.rareza)}
                  </div>
                )}

                {/* Lock icon si no desbloqueado */}
                {!badge.desbloqueado && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🔒
                  </motion.div>
                )}

                {/* Puntos */}
                {badge.desbloqueado && (
                  <div className="text-xs text-white/90 font-semibold mt-2">
                    +{badge.puntos} pts
                  </div>
                )}
              </div>

              {/* Progreso */}
              {!badge.desbloqueado && (
                <div className="mt-3 bg-gray-300 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(badge.progreso / badge.total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-3 py-2 whitespace-nowrap pointer-events-none z-50 hidden group-hover:block"
            >
              {badge.descripcion}
              {!badge.desbloqueado && (
                <div className="text-xs mt-1 text-gray-300">
                  {badge.progreso}/{badge.total}
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sección de próximas insignias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200"
      >
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Flame className="text-orange-500" size={24} />
          Próximas a desbloquear
        </h3>
        <div className="space-y-3">
          {badges
            .filter((b) => !b.desbloqueado)
            .slice(0, 3)
            .map((badge) => (
              <div key={badge.id} className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{badge.icono}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {badge.nombre}
                      </p>
                      <p className="text-xs text-gray-600">
                        {badge.descripcion}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">
                      {badge.progreso}/{badge.total}
                    </p>
                    <p className="font-bold text-indigo-600 text-sm">
                      +{badge.puntos} pts
                    </p>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(badge.progreso / badge.total) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
                  />
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
};

export default BadgesSystem;
