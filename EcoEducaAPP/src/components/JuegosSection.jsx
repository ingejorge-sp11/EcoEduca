import React from "react";
import hojaImg from "../assets/hoja.png";

const juegos = [
  {
    titulo: "Clasificación de Residuos",
    descripcion: "Arrastra la basura al contenedor correcto",
    juegoKey: "juego-residuos"
  },
  {
    titulo: "Proceso de Reciclaje (Animado)",
    descripcion: "Descubre el paso a paso del reciclaje con animaciones.",
    juegoKey: "juego-reciclaje-animado"
  },

];

const JuegosSection = ({ onSelectJuego }) => {
  return (
   <section className="relative py-16 bg-gradient-to-b from-green-100 to-green-50 overflow-hidden">
  {}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => {
      const animaciones = ['fall-leaf-left', 'fall-leaf-right', 'fall-leaf-center'];
      const animacion = animaciones[Math.floor(Math.random() * animaciones.length)];
      
      return (
        <img
          key={i}
          src={hojaImg}
          alt="hoja"
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            width: `${24 + Math.random() * 12}px`,
            height: `${24 + Math.random() * 12}px`,
            opacity: 0.7 + Math.random() * 0.3,
            animation: `${animacion} ${8 + Math.random() * 6}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.random() * 4}s infinite`,
            filter: `hue-rotate(${Math.random() * 30}deg) drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.15))`,
          }}
        />
      );
    })}
  </div>

  <div className="relative container mx-auto px-4">
    <h3 className="text-3xl md:text-4xl font-extrabold text-center text-green-900 mb-12">
      Juegos Ambientales
    </h3>

    <div className="flex flex-wrap justify-center gap-6">
      {juegos.map((juego, index) => (
        <div
          key={index}
          className="w-52 h-52 bg-white rounded-xl shadow-lg flex flex-col justify-center items-center text-center p-6 cursor-pointer transform transition-transform hover:scale-105 hover:shadow-2xl hover:rotate-1"
          onClick={() => onSelectJuego(juego.juegoKey)}
        >
          <h3 className="font-bold text-lg text-green-800 mb-2">{juego.titulo}</h3>
          <p className="text-sm text-green-700">{juego.descripcion}</p>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    @keyframes fall-leaf-left {
      0% { 
        transform: translateY(-20px) translateX(0px) rotate(0deg) scale(0.8);
        opacity: 0;
      }
      10% { 
        opacity: 1;
      }
      50% {
        transform: translateY(50vh) translateX(-40px) rotate(180deg) scale(1.1);
      }
      90% {
        opacity: 1;
      }
      100% { 
        transform: translateY(100vh) translateX(-80px) rotate(360deg) scale(0.9);
        opacity: 0;
      }
    }
    
    @keyframes fall-leaf-right {
      0% { 
        transform: translateY(-20px) translateX(0px) rotate(0deg) scale(0.8);
        opacity: 0;
      }
      10% { 
        opacity: 1;
      }
      50% {
        transform: translateY(50vh) translateX(40px) rotate(180deg) scale(1.1);
      }
      90% {
        opacity: 1;
      }
      100% { 
        transform: translateY(100vh) translateX(80px) rotate(360deg) scale(0.9);
        opacity: 0;
      }
    }
    
    @keyframes fall-leaf-center {
      0% { 
        transform: translateY(-20px) rotate(0deg) scale(0.8);
        opacity: 0;
      }
      10% { 
        opacity: 1;
      }
      50% {
        transform: translateY(50vh) rotate(180deg) scale(1.1);
      }
      90% {
        opacity: 1;
      }
      100% { 
        transform: translateY(100vh) rotate(360deg) scale(0.9);
        opacity: 0;
      }
    }
    
    .animate-fall-leaf-enhanced {
      animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
      animation-iteration-count: infinite;
      filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.15));
    }
  `}</style>
</section>


  );
};

export default JuegosSection;
