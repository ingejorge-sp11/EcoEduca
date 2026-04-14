
import React, { useState } from 'react';

const residuos = [
  {
    nombre: 'Botella de plástico',
    imagen: 'https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/botella%20de%20agua.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9ib3RlbGxhIGRlIGFndWEucG5nIiwiaWF0IjoxNzczNjI5NDQyLCJleHAiOjE4MDUxNjU0NDJ9.0HkuEjwV-VnvohiUECimQ3irPzDhP7iu-W_sep0X-3I',
    procesos: [
      { nombre: 'Triturar', correcto: true, explicacion: 'Las botellas de plástico se trituran para facilitar su reciclaje.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'Primero deben triturarse antes de fundirse.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado es importante, pero el primer paso es triturar.' }
    ],
    resultado: 'Escamas de plástico listas para fundirse.'
  },
  {
    nombre: 'Lata de aluminio',
    imagen: 'https://cdn-icons-png.flaticon.com/512/686/686589.png',
    procesos: [
      { nombre: 'Fundir', correcto: true, explicacion: 'Las latas de aluminio se funden para crear nuevas piezas.' },
      { nombre: 'Triturar', correcto: false, explicacion: 'No es necesario triturar el aluminio, se funde directamente.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado es importante, pero el proceso clave es fundir.' }
    ],
    resultado: 'Aluminio líquido para nuevos productos.'
  },
  {
    nombre: 'Papel',
    imagen: 'https://cdn-icons-png.flaticon.com/512/1046/1046857.png',
    procesos: [
      { nombre: 'Lavar', correcto: true, explicacion: 'El papel se lava y se desintegra para eliminar tintas e impurezas.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'El papel no se funde, se lava y se prensa.' },
      { nombre: 'Triturar', correcto: false, explicacion: 'El triturado no es el proceso principal para el papel.' }
    ],
    resultado: 'Pulpa de papel lista para reciclar.'
  },
  {
    nombre: 'Cartón',
    imagen: 'https://cdn-icons-png.flaticon.com/512/1046/1046858.png',
    procesos: [
      { nombre: 'Prensar', correcto: true, explicacion: 'El cartón se prensa para compactarlo antes de reciclar.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'El cartón no se funde, se prensa y recicla.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado no es el proceso principal para el cartón.' }
    ],
    resultado: 'Cartón prensado listo para reciclar.'
  },
  {
    nombre: 'Vidrio',
    imagen: 'https://cdn-icons-png.flaticon.com/512/2921/2921820.png',
    procesos: [
      { nombre: 'Fundir', correcto: true, explicacion: 'El vidrio se funde para crear nuevos envases.' },
      { nombre: 'Triturar', correcto: false, explicacion: 'El triturado es previo, pero el proceso clave es fundir.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado es importante, pero el proceso clave es fundir.' }
    ],
    resultado: 'Vidrio fundido para nuevos envases.'
  },
  {
    nombre: 'Tetrapak',
    imagen: 'https://cdn-icons-png.flaticon.com/512/1046/1046861.png',
    procesos: [
      { nombre: 'Separar capas', correcto: true, explicacion: 'El tetrapak se separa en capas de cartón, plástico y aluminio.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'Primero se separan las capas antes de fundir.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado es importante, pero el proceso clave es separar capas.' }
    ],
    resultado: 'Materiales separados para reciclaje.'
  },
  {
    nombre: 'Residuos electrónicos',
    imagen: 'https://cdn-icons-png.flaticon.com/512/1046/1046870.png',
    procesos: [
      { nombre: 'Desmontar', correcto: true, explicacion: 'Los electrónicos se desmontan para separar componentes y materiales.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'No se funden directamente, primero se desmontan.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado no es el proceso principal para electrónicos.' }
    ],
    resultado: 'Componentes separados para reciclaje.'
  },
  {
    nombre: 'Orgánicos',
    imagen: 'https://cdn-icons-png.flaticon.com/512/590/590685.png',
    procesos: [
      { nombre: 'Compostar', correcto: true, explicacion: 'Los residuos orgánicos se compostan para crear abono.' },
      { nombre: 'Fundir', correcto: false, explicacion: 'No se funden, se compostan.' },
      { nombre: 'Lavar', correcto: false, explicacion: 'El lavado no es el proceso principal para orgánicos.' }
    ],
    resultado: 'Abono natural para plantas.'
  }
];

export default function JuegoReciclajeAnimado() {
    // Puntaje requerido para la misión diaria de reciclaje
    const PUNTAJE_MISION = 25;
  const [indice, setIndice] = useState(0);
  const [acierto, setAcierto] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [final, setFinal] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(null);
  const [userId, setUserId] = useState(null);
  const [errorUsuario, setErrorUsuario] = useState(null);
  const [procesosMezclados, setProcesosMezclados] = useState(() => [...residuos[0].procesos]);

  // Función para obtener el best score actualizado
  const fetchBestScore = async () => {
    setErrorUsuario(null);
    // Preferir userId desde localStorage para consistencia incluso si el backend está caído
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u && (u.id || u._id)) {
        setUserId(u.id || u._id);
      }
    } catch (_) {}
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorUsuario('No se encontró el token de sesión. Por favor, inicia sesión de nuevo.');
      return;
    }
    try {
      // Intentar primero el endpoint estable /v1/users/profile
      const resProfile = await fetch('/api/v1/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resProfile.ok) {
        const profile = await resProfile.json();
        setUserId(profile.id);
        setHighScore(profile.puntuacion_segundo || 0);
        setErrorUsuario(null);
      } else {
        // Fallback a /usuarios/me si el perfil falla
        const resMe = await fetch('/api/usuarios/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resMe.ok) {
          const userData = await resMe.json();
          setUserId(userData.id);
          setHighScore(userData.puntuacion_segundo || 0);
        } else if (resMe.status === 401 || resMe.status === 403) {
          setErrorUsuario('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.');
        } else {
          setErrorUsuario('No se pudo obtener datos del usuario.');
        }
      }
    } catch (err) {
      setErrorUsuario('No se pudo conectar con el servidor.');
    }
  };

  // Función para guardar el mejor puntaje en la base de datos
  const guardarPuntajeSegundo = async (puntos) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch('/api/usuarios/me/guardar-mejor-puntaje-segundo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ puntuacion_segundo: puntos })
      });
      if (response.ok) {
        // Vuelve a consultar el best score actualizado desde la BD
        await fetchBestScore();
      }
    } catch (err) {
      console.error('Error guardando puntuacion_segundo:', err);
    }
  };

  // Obtener el best score y el id del usuario al montar
  React.useEffect(() => {
    fetchBestScore();
  }, []);

  const residuo = residuos[indice];

  // Mezclar el orden de los procesos para que la respuesta correcta
  // no aparezca siempre en la misma posición
  React.useEffect(() => {
    if (!residuos.length) return;
    const copiaProcesos = [...residuo.procesos];
    copiaProcesos.sort(() => Math.random() - 0.5);
    setProcesosMezclados(copiaProcesos);
  }, [indice, residuo, residuos]);

  const handleProceso = async (proceso) => {
    setAcierto(proceso.correcto);
    setMensaje(proceso.explicacion);
    if (proceso.correcto) {
      // Sumar 5 puntos por acierto
      const nuevoScore = score + 5;
      setScore(nuevoScore);
      // Actualizar mejor puntaje si corresponde
      if (nuevoScore > highScore && userId) {
        await guardarPuntajeSegundo(nuevoScore);
        // Refresca el best score desde la base de datos
        await fetchBestScore();
      }
      setTimeout(() => {
        if (indice < residuos.length - 1) {
          setIndice(indice + 1);
          setAcierto(null);
          setMensaje('');
        } else {
          // Al finalizar el juego, guardar el puntaje de hoy si cumple la misión
          const hoyISO = new Date().toISOString().slice(0, 10);
          if (nuevoScore >= PUNTAJE_MISION) {
            const uid = userId ?? 'anon';
            localStorage.setItem(`reciclaje_puntos_${hoyISO}_u${uid}`, nuevoScore);
          }
          setFinal(true);
        }
      }, 1200);
    }
  };

  const handleReiniciar = () => {
    // Antes de reiniciar, guardar el puntaje de hoy si cumple la misión
    const hoyISO = new Date().toISOString().slice(0, 10);
    if (score >= PUNTAJE_MISION) {
      const uid = userId ?? 'anon';
      localStorage.setItem(`reciclaje_puntos_${hoyISO}_u${uid}`, score);
    }
    setIndice(0);
    setAcierto(null);
    setMensaje('');
    setFinal(false);
    setScore(0);
  };

  return (
    <div className="bg-gradient-to-b from-sky-50 via-emerald-50 to-white rounded-3xl shadow-xl p-6 sm:p-8 max-w-3xl mx-auto flex flex-col items-center relative overflow-visible">
      {errorUsuario && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded w-full text-center font-semibold">{errorUsuario}</div>
      )}
      <div className="flex flex-row gap-4 mb-3 w-full justify-end items-center">
        <div className="flex gap-6 text-sm font-bold">
          <div className="text-emerald-800">
            <span className="block text-xs uppercase tracking-wide text-emerald-700/80">Puntaje</span>
            <span className="text-xl">⭐ {score}</span>
          </div>
          <div className="text-amber-700">
            <span className="block text-xs uppercase tracking-wide text-amber-700/80">Mejor</span>
            <span className="text-xl">🏆 {highScore !== null ? highScore : '...'}</span>
          </div>
        </div>
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 text-emerald-800 text-center tracking-tight">Quiz de Procesos de Reciclaje</h2>
      <div className="mb-4" />
      {!final ? (
        <>
          {/* Zona principal: tarjeta del residuo arriba y respuestas abajo */}
          <div className="w-full flex flex-col gap-6 items-stretch mt-2">
            {/* Tarjeta del residuo objetivo */}
            <div className="flex-1 flex flex-col items-center justify-center bg-white/80 border border-emerald-100 rounded-2xl shadow-lg p-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-6 text-7xl opacity-10 select-none">
                ♻️
              </div>
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 mb-1">Residuo objetivo</span>
              <h3 className="font-extrabold text-lg sm:text-xl mb-2 text-emerald-900 text-center">{residuo.nombre}</h3>
              <div className="bg-gradient-to-b from-sky-100 to-emerald-100 rounded-3xl border border-emerald-200 shadow-inner flex items-center justify-center w-60 h-60 sm:w-72 sm:h-72 mb-3">
                <img
                  src={residuo.imagen}
                  alt={residuo.nombre}
                  className="h-36 sm:h-44 drop-shadow-xl"
                />
              </div>
              <p className="text-sm text-emerald-700 text-center font-medium">¿Qué proceso se realiza en la planta para reciclarlo?</p>
            </div>

            {/* Tarjetas de respuesta alineadas en fila (3 columnas en pantallas amplias) */}
            <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {procesosMezclados.map((proceso, i) => {
                const letras = ['A', 'B', 'C', 'D'];
                // Paleta vibrante: verde, azul y café más llamativos
                const coloresBase = ['bg-emerald-400', 'bg-sky-400', 'bg-amber-500'];
                const color = coloresBase[i % coloresBase.length];

                let estadoClase = '';
                if (acierto === null) {
                  estadoClase = `${color} hover:brightness-110 hover:scale-[1.02]`;
                } else if (proceso.correcto) {
                  estadoClase = 'bg-emerald-500';
                } else {
                  estadoClase = 'bg-rose-400';
                }

                return (
                  <button
                    key={i}
                    disabled={acierto !== null}
                    onClick={() => handleProceso(proceso)}
                    className={`relative rounded-2xl shadow-lg border border-white/40 text-white font-bold px-4 py-3 text-left flex items-center gap-3 transition-transform duration-150 hover:shadow-2xl ${estadoClase} ${acierto !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-gray-900 text-base shadow-inner flex-shrink-0">
                      {letras[i]}
                    </div>
                    <span className="text-sm sm:text-base leading-snug">
                      {proceso.nombre}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {mensaje && (
            <div className={`mb-2 text-center ${acierto ? 'text-green-700' : 'text-red-700'}`}>{mensaje}</div>
          )}
          {acierto === false && (
            <button className="bg-green-600 text-white px-4 py-2 rounded mt-2" onClick={handleReiniciar}>Jugar de nuevo</button>
          )}
          {acierto && (
            <div className="mt-2 text-green-800 font-semibold">{residuo.resultado}</div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4 flex items-center justify-center bg-green-100 rounded-full">
            <span className="text-7xl">🏆</span>
          </div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">¡Felicidades!</h3>
          <p className="mb-4 text-center">Completaste el proceso de reciclaje para todos los residuos. ¡Eres un experto reciclador!</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleReiniciar}>Jugar de nuevo</button>
        </div>
      )}
    </div>
  );
}
