import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const NoticiaCarousel = ({ noticias }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [direction, setDirection] = useState(0);

  // Auto-play cada 8 segundos
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1 === noticias.length ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, [isAutoPlay, noticias.length]);

  const handleNext = () => {
    setIsAutoPlay(false);
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === noticias.length ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setIsAutoPlay(false);
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? noticias.length - 1 : prevIndex - 1
    );
  };

  if (!noticias || noticias.length === 0) {
    return null;
  }

  const currentNoticia = noticias[currentIndex];

  // Mapear propiedades de API
  const titulo = currentNoticia.title || currentNoticia.titulo || "Sin título";
  const contenido = currentNoticia.summary || currentNoticia.contenido || currentNoticia.descripcion || "";
  const categoria = currentNoticia.categoria || currentNoticia.category || "Noticia";
  const fecha = currentNoticia.date || currentNoticia.fecha || new Date().toLocaleDateString("es-ES");

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Carrusel principal */}
      <motion.div
        className="relative bg-gradient-to-r from-gray-50 to-white rounded-2xl overflow-hidden"
        style={{ minHeight: "400px" }}
      >
        {/* Patrón de fondo decorativo */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonal-lines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          </svg>
        </div>

        {/* Ilustración decorativa derecha */}
        <motion.div
          className="absolute right-8 top-1/2 transform -translate-y-1/2 opacity-40 pointer-events-none"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
            {/* Planta */}
            <g>
              {/* Tallo */}
              <path d="M100 150 Q95 120, 98 90" stroke="#22c55e" strokeWidth="2" fill="none" />
              {/* Hoja izquierda grande */}
              <ellipse cx="75" cy="80" rx="20" ry="35" fill="#16a34a" opacity="0.8" transform="rotate(-45 75 80)" />
              {/* Hoja izquierda pequeña */}
              <ellipse cx="65" cy="110" rx="15" ry="25" fill="#22c55e" opacity="0.7" transform="rotate(-30 65 110)" />
              {/* Hoja derecha grande */}
              <ellipse cx="125" cy="85" rx="20" ry="35" fill="#16a34a" opacity="0.8" transform="rotate(45 125 85)" />
              {/* Hoja derecha pequeña */}
              <ellipse cx="135" cy="115" rx="15" ry="25" fill="#22c55e" opacity="0.7" transform="rotate(30 135 115)" />
              {/* Hoja superior */}
              <ellipse cx="100" cy="60" rx="12" ry="20" fill="#10b981" opacity="0.9" />
            </g>
          </svg>
        </motion.div>

        <div className="relative z-10 flex items-stretch">
          {/* Contenido principal */}
          <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
            <div>
              {/* Badge de categoría */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
                  {categoria}
                </span>
              </motion.div>

              {/* Título principal */}
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl font-black text-gray-900 mt-6 mb-4 leading-tight"
                >
                  {titulo}
                </motion.h2>
              </AnimatePresence>

              {/* Descripción */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`desc-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-gray-600 text-lg leading-relaxed max-w-xl"
                >
                  {contenido}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Controles navegación inferior */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  <ChevronLeft size={24} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                >
                  <ChevronRight size={24} />
                </motion.button>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600 font-medium">
                  <span className="text-gray-900 font-bold text-lg">{currentIndex + 1}</span>
                  <span className="text-gray-400"> / {noticias.length}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Información derecha - Fecha */}
          <div className="hidden lg:flex items-start p-8 text-right">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-end gap-4"
            >
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{fecha}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Barra inferior decorativa (tierra) */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-amber-800/20 pointer-events-none">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1000 80" className="opacity-30">
            <defs>
              <pattern id="soil" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="#78350f" />
                <circle cx="30" cy="20" r="1.5" fill="#92400e" />
                <circle cx="20" cy="35" r="1" fill="#b45309" />
              </pattern>
            </defs>
            <rect width="1000" height="80" fill="url(#soil)" />
          </svg>
        </div>
      </motion.div>

      {/* Indicadores de puntos */}
      <div className="flex gap-3 justify-center mt-8">
        {noticias.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => {
              setIsAutoPlay(false);
              setCurrentIndex(index);
            }}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            className={`transition-all rounded-full ${
              currentIndex === index
                ? "bg-green-500 w-3 h-3 shadow-lg"
                : "bg-gray-300 w-2 h-2 hover:bg-green-400"
            }`}
          />
        ))}
      </div>

      {/* Fecha móvil */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="lg:hidden text-right mt-6 pr-4"
      >
        <div className="flex items-center justify-end gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">{fecha}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NoticiaCarousel;
