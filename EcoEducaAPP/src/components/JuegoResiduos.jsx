import React, { useState, useEffect } from "react";
import banana from '../assets/objetos/banana.png';
import manzana from '../assets/objetos/manzana.png';
import naranja from '../assets/objetos/naranja.png';
import huevo from '../assets/objetos/huevo.png';
import paisaje2 from '../assets/paisaje2.0.jpg';

export default function JuegoResiduos() {
    const [consejo, setConsejo] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [objetosEnPantalla, setObjetosEnPantalla] = useState([]);
  const [userId, setUserId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(60); 
  const [timerActive, setTimerActive] = useState(false);

  const objetos = [
    { nombre: "Cáscara de plátano", categoria: "organico", imagen: banana },
    { nombre: "Restos de manzana", categoria: "organico", imagen: manzana },
    { nombre: "Cáscara de naranja", categoria: "organico", imagen: naranja },
    { nombre: "Cáscara de huevo", categoria: "organico", imagen: huevo },
  ];

  const contenedoresConfig = {
    organico: { emoji: "🍃", color: "#7CAB70", label: "ORGÁNICO" },
    reciclable: { emoji: "♻️", color: "#7BA3D0", label: "PAPEL Y CARTÓN" },
    vidrio: { emoji: "🧪", color: "#E6C94F", label: "PLÁSTICO" },
    peligroso: { emoji: "☣️", color: "#E08080", label: "PELIGROSO" },
    no_reciclable: { emoji: "🚯", color: "#A9A9A9", label: "NO RECICLABLE" },
  };

  const generarObjetos = async () => {
    const nuevosObjetos = [];
    for (let i = 0; i < 8; i++) {
      const objeto = objetos[Math.floor(Math.random() * objetos.length)];
      nuevosObjetos.push({
        ...objeto,
        id: Math.random(),
        posX: Math.random() * 85 + 7.5,
        posY: Math.random() * 40 + 35,
      });
    }
    return nuevosObjetos;
  };

  useEffect(() => {
    (async () => {
      // Preferir userId desde localStorage para consistencia
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u && (u.id || u._id)) {
          setUserId(u.id || u._id);
        }
      } catch (_) {}
      // Obtener usuario del token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Intentar primero el endpoint estable /v1/users/profile
          const profileResponse = await fetch('http://localhost:3002/api/v1/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            // console.debug('Perfil /v1/users/profile:', profile);
            setUserId(prev => prev ?? profile.id);
            setMejorPuntuacion(profile.puntuacion || 0);
          } else {
            // Fallback a /usuarios/me solo si el perfil falla
            const userResponse = await fetch('http://localhost:3002/api/usuarios/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              // console.debug('Perfil /usuarios/me:', userData);
              setUserId(prev => prev ?? userData.id);
              setMejorPuntuacion(userData.puntuacion || 0);
            } else {
              // Evitar logs ruidosos en producción, solo aviso mínimo
              // console.warn('No se pudo obtener perfil de usuario (me/profile).');
            }
          }
        } catch (err) {
          // console.warn('Error obteniendo datos del usuario:', err);
        }
      }
      // Generar objetos iniciales
      const objetosIniciales = await generarObjetos();
      setObjetosEnPantalla(objetosIniciales);
      setCargando(false);
      setTimerActive(true);
      setTiempoRestante(60);
    })();
  }, []);

  // Obtener consejo cuando termina el juego
  useEffect(() => {
    if (gameOver) {
      fetch('http://localhost:3002/api/consejo-aleatorio')
        .then(res => res.json())
        .then(data => setConsejo(data.descripcion || ""))
        .catch(() => setConsejo(""));

      // Registrar puntos del día para Misiones Diarias
      try {
        const hoyISO = new Date().toISOString().slice(0, 10);
        const actual = puntajeFinal || puntaje;
        const uid = userId ?? 'anon';
        const key = `residuos_puntos_${hoyISO}_u${uid}`;
        const almacenado = Number(localStorage.getItem(key)) || 0;
        const mejorDelDia = Math.max(almacenado, actual);
        localStorage.setItem(key, mejorDelDia);
      } catch (_) {
        // Ignorar errores de localStorage
      }
    }
  }, [gameOver]);

  // Temporizador
  useEffect(() => {
    let interval = null;
    if (timerActive && !gameOver) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            setPuntajeFinal(puntaje);
            setMensaje("⏰ ¡Se acabó el tiempo!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver, puntaje]);

  const handleDrop = (e, categoria) => {
    e.preventDefault();
    if (gameOver || objetosEnPantalla.length === 0) return;

    const data = e.dataTransfer.getData("text");
    if (!data) return;

    const objetoActual = JSON.parse(data);

    if (objetoActual.categoria === categoria) {
      // ACIERTO
      setPuntaje((prev) => prev + 10);
      setMensaje(`✅ ¡Correcto! ${objetoActual.nombre}`);

      const nuevosObjetos = objetosEnPantalla.filter(
        (obj) => obj.id !== objetoActual.id
      );

      if (nuevosObjetos.length === 0) {
        (async () => {
          const objetos = await generarObjetos();
          setObjetosEnPantalla(objetos);
        })();
      } else {
        setObjetosEnPantalla(nuevosObjetos);
      }

      setTimeout(() => setMensaje(""), 1000);
    } else {
      // ERROR - Guardar puntaje en BD si es mayor al anterior
      setGameOver(true);
      setPuntajeFinal(puntaje);
      setMensaje(`❌ Error: ${objetoActual.nombre} NO va aquí`);
      
      if (puntaje > mejorPuntuacion && userId) {
        guardarPuntaje(puntaje);
      } else if (puntaje > mejorPuntuacion) {
        setMejorPuntuacion(puntaje);
      }
    }
  };

  const guardarPuntaje = async (puntos) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3002/api/usuarios/me/guardar-mejor-puntaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ puntos })
      });

      if (response.ok) {
        const data = await response.json();
        setMejorPuntuacion(data.mejorPuntuacionActual || puntos);
      }
    } catch (err) {
      console.error('Error guardando puntaje:', err);
    }
  };

  const reiniciarJuego = async () => {
    setPuntaje(0);
    setGameOver(false);
    setPuntajeFinal(0);
    setMensaje("");
    setTiempoRestante(60);
    setTimerActive(true);
    const nuevosObjetos = await generarObjetos();
    setObjetosEnPantalla(nuevosObjetos);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="text-white rounded-lg shadow-lg p-2 mb-2 relative overflow-hidden" style={{ backgroundColor: '#9DBFA5' }}>
        {/* Hojas cayendo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '10%', animationDelay: '0s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '25%', animationDelay: '1s'}}>🍂</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '40%', animationDelay: '0.5s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '60%', animationDelay: '1.5s'}}>🍂</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '75%', animationDelay: '0.8s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '90%', animationDelay: '1.2s'}}>🍂</div>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-xl font-bold">🌍 EcoJuego</h1>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-green-50">Puntaje</p>
              <p className="text-2xl font-bold">{puntaje}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-yellow-50">Mejor</p>
              <p className="text-2xl font-bold">🏆 {mejorPuntuacion}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-50">Tiempo</p>
              <p className="text-2xl font-bold">⏰ {`${Math.floor(tiempoRestante/60)}:${(tiempoRestante%60).toString().padStart(2,'0')}`}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-green-50 relative z-10">• Arrastra los residuos al contenedor correcto • Clasifica correctamente para ganar puntos</p>
      </div>

      {/* Mensaje flotante */}
      {mensaje && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-5 py-2 text-base font-bold z-50 border-2 border-green-400">
          {mensaje}
        </div>
      )}

      {!gameOver ? (
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {/* Área de juego con fondo */}
          <div 
            className="w-full h-full rounded-lg shadow-xl relative border-4 border-green-600 overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${paisaje2})`,
            }}
          >
            {/* Contenedores en la parte inferior */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 px-3">
              {Object.entries(contenedoresConfig).map(([id, config]) => (
                <div
                  key={id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, id)}
                  className="group cursor-pointer flex-1 max-w-xs"
                >
                  {/* Bote de basura */}
                  <div className="transform transition-all hover:scale-110 relative">
                    {/* Tapa */}
                    <div
                      className="rounded-t-full px-3 py-1 text-center shadow-md"
                      style={{ backgroundColor: config.color }}
                    >
                      <div className="text-xl">{config.emoji}</div>
                    </div>
                    
                    {/* Cuerpo */}
                    <div
                      className="rounded-b-2xl px-3 py-2 text-center border-l-4 border-r-4 border-b-4 border-gray-800 shadow-lg"
                      style={{ 
                        backgroundColor: config.color,
                        filter: 'brightness(0.85)'
                      }}
                    >
                      <p className="text-white font-bold text-xs">{config.label}</p>
                    </div>

                    {/* Línea de apertura */}
                    <div
                      className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full opacity-40"
                      style={{ 
                        backgroundColor: config.color,
                        filter: 'brightness(1.2)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Objetos dispersos en el área */}
            {objetosEnPantalla.length > 0 ? (
              objetosEnPantalla.map((objeto) => (
                <div
                  key={objeto.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text", JSON.stringify(objeto));
                  }}
                  className="absolute w-24 h-24 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                  style={{
                    left: `${objeto.posX}%`,
                    top: `${objeto.posY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title={objeto.nombre}
                >
                  <img
                    src={objeto.imagen}
                    alt={objeto.nombre}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-white font-bold">
                ⏳ Cargando...
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Game Over Modal */
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ fontFamily: `'Comic Sans MS', 'Comic Sans', cursive, sans-serif` }}>
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full border-4" style={{ backgroundColor: '#9DBFA5', borderColor: '#388E3C', fontFamily: `'Comic Sans MS', 'Comic Sans', cursive, sans-serif` }}>
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow">¡GAME OVER!</h2>
              <div className="rounded-xl p-4 mb-6 shadow-inner" style={{ backgroundColor: '#F5F5F4' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Tu Puntuación</p>
                    <p className="text-3xl font-bold text-red-500">{puntajeFinal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Best Score</p>
                    <p className="text-3xl font-bold text-yellow-500">🏆 {mejorPuntuacion}</p>
                  </div>
                </div>
              </div>
              {/* Consejo aleatorio */}
              {consejo && (
                <div className="mx-auto mb-6 p-4 rounded-xl shadow-lg max-w-xs flex flex-col items-center animate-fade-in" style={{ backgroundColor: '#E9D8B4', border: '2px solid #B08968' }}>
                  <span className="font-bold text-lg text-[#7B4F1D] mb-1">Dato curioso</span>
                  <span className="text-base text-gray-800 text-center">{consejo}</span>
                </div>
              )}
              <button
                onClick={reiniciarJuego}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-base mt-2 shadow"
              >
                Jugar de Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px); }
        }
        @keyframes fall-leaf {
          0% {
            top: -10px;
            opacity: 0;
            transform: translateX(0) rotateZ(0deg);
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            top: 100%;
            opacity: 0;
            transform: translateX(100px) rotateZ(360deg);
          }
        }
        .animate-fall-leaf {
          animation: fall-leaf 3s linear infinite;
        }
      `}</style>

      {/* Crédito de autoría */}
      <div className="text-center text-xs text-gray-600 mt-2">
        Fondo de paisaje: Escena natural con estanque y árboles por{' '}
        <a 
          href="https://www.freepik.es/vector-gratis/escena-natural-estanque-arboles_24467604.htm#fromView=keyword&page=1&position=5&uuid=0e71d363-f52a-466f-9d4b-69670d88d0ed&query=Lago+animada" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-700 hover:text-green-800 underline"
        >
          brgfx en Freepik
        </a>
      </div>
    </div>
  );
}