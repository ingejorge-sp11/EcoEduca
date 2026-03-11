


import React, { useState } from 'react';

const residuos = [
  {
    nombre: 'Botella de plástico',
    imagen: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png',
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
      const resProfile = await fetch('http://localhost:3002/api/v1/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resProfile.ok) {
        const profile = await resProfile.json();
        setUserId(profile.id);
        setHighScore(profile.puntuacion_segundo || 0);
        setErrorUsuario(null);
      } else {
        // Fallback a /usuarios/me si el perfil falla
        const resMe = await fetch('http://localhost:3002/api/usuarios/me', {
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
      const response = await fetch('http://localhost:3002/api/usuarios/me/guardar-mejor-puntaje-segundo', {
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
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto flex flex-col items-center relative overflow-visible">
      {errorUsuario && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded w-full text-center font-semibold">{errorUsuario}</div>
      )}
      <div className="flex flex-row gap-6 mb-2 w-full justify-between">
        <div className="text-green-800 font-bold">Puntaje: {score}</div>
        <div className="text-yellow-700 font-bold">Mejor puntaje: {highScore !== null ? highScore : '...'}</div>
      </div>
      <h2 className="text-xl font-bold mb-4 text-green-700">Juego: Planta de Reciclaje</h2>
      {!final ? (
        <>
          {/* Fondo de planta */}
          <div className="w-full h-56 mb-4 flex items-end justify-center relative" style={{background: 'linear-gradient(180deg, #e0f2fe 60%, #b9e6c9 100%)', borderRadius: '1rem'}}>
            {/* Cinta transportadora */}
            <div style={{position:'absolute', left:0, right:0, bottom:40, height:32, background:'#888', borderRadius:16, boxShadow:'0 2px 8px #0002', zIndex:1}}>
              <div style={{position:'absolute', left:12, bottom:-18, width:28, height:28, background:'#666', borderRadius:'50%', border:'4px solid #444'}}></div>
              <div style={{position:'absolute', right:12, bottom:-18, width:28, height:28, background:'#666', borderRadius:'50%', border:'4px solid #444'}}></div>
              {/* Líneas de la cinta */}
              {[...Array(6)].map((_,i)=>(
                <div key={i} style={{position:'absolute', left:`${15+i*45}px`, top:8, width:8, height:16, background:'#bbb', borderRadius:4, opacity:0.7}}></div>
              ))}
            </div>
            {/* Residuo sobre la cinta */}
            <img src={residuo.imagen} alt={residuo.nombre} className="h-32 z-10" style={{position:'absolute', left:'50%', transform:'translateX(-50%)', bottom:56}} />
          </div>
          <h3 className="font-bold text-lg mb-2 text-green-800">{residuo.nombre}</h3>
          <p className="mb-4 text-center font-medium">¿Qué proceso se realiza en la planta?</p>
          <div className="flex flex-wrap gap-3 mb-4">
            {residuo.procesos.map((proceso, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded font-bold border transition-colors ${acierto === null ? 'bg-gray-100 hover:bg-green-200' : proceso.correcto ? 'bg-green-500 text-white' : 'bg-red-300 text-white'}`}
                disabled={acierto !== null}
                onClick={() => handleProceso(proceso)}
              >
                {proceso.nombre}
              </button>
            ))}
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
