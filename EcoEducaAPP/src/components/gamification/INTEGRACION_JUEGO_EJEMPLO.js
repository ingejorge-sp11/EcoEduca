
const guardarPuntosEnServidor = async (puntosGanados) => {
  const token = localStorage.getItem('token');
  const userIdLocal = localStorage.getItem('userId'); 

  if (!userIdLocal || !token) {
    console.error('Usuario no autenticado');
    return false;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/usuario/${userIdLocal}/puntos`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          puntos_ganados: puntosGanados
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al guardar puntos:', error);
      return false;
    }

    const data = await response.json();
    console.log('✅ Puntos guardados exitosamente:', data);
    return true;
  } catch (error) {
    console.error('Error en la solicitud:', error);
    return false;
  }
};

// OPCIÓN A: Si tienes un botón "Terminar Juego"
const handleTerminarJuego = async () => {
  // Guardar puntos antes de terminar
  const exito = await guardarPuntosEnServidor(puntaje);

  if (exito) {
    // Mostrar mensaje de éxito
    setMensaje(`¡Ganaste ${puntaje} puntos! ⭐`);

    // Opcionalmente redirigir a Misiones después de 2 segundos
    setTimeout(() => {
      window.location.href = '/misiones';
    }, 2000);
  } else {
    setMensaje('Error al guardar puntos. Intenta de nuevo.');
  }

  setGameOver(true);
};


// Agregar useEffect que monitoree el estado del juego
useEffect(() => {
  // Cuando gameOver cambia a true, guardar puntos
  if (gameOver && puntajeFinal > 0) {
    guardarPuntosEnServidor(puntajeFinal).then((exito) => {
      if (exito) {
        console.log('Puntos guardados. Puedes volver a /misiones');
      }
    });
  }
}, [gameOver, puntajeFinal]);


const manejarRespuestaCorrecta = async (puntos) => {
  const nuevoPuntaje = puntaje + puntos;
  setPuntaje(nuevoPuntaje);

  // Guardar progresivamente en servidor
  const exito = await guardarPuntosEnServidor(nuevoPuntaje);

  if (exito) {
    // El usuario está acumulando puntos en el servidor
    console.log(`Progreso guardado: ${nuevoPuntaje} puntos`);
  }
};

{gameOver && (
  <div className="game-over-screen">
    <h2>Juego Terminado</h2>
    <p>Puntaje Final: {puntajeFinal}</p>

    {/* Botón para volver a Misiones */}
    <button
      onClick={() => window.location.href = '/misiones'}
      className="btn-volver"
    >
      Volver a Misiones
    </button>
  </div>
)}


const guardarPuntosConReintentos = async (puntosGanados, intentos = 3) => {
  for (let i = 1; i <= intentos; i++) {
    try {
      const respuesta = await fetch(
        `http://localhost:3001/api/usuario/${userId}/puntos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ puntos_ganados: puntosGanados })
        }
      );

      if (respuesta.ok) {
        console.log(`✅ Puntos guardados (intento ${i})`);
        return true;
      } else if (i === intentos) {
        console.error('Falló después de 3 intentos');
        return false;
      }

      // Esperar 1 segundo antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      if (i === intentos) {
        console.error('Error fatal:', error);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};


const handleGuardarYVolver = async () => {
  // Mostrar cargando
  setMensaje('Guardando puntos...');

  // Guardar puntos con reintentos
  const exito = await guardarPuntosConReintentos(puntajeFinal);

  if (exito) {
    // Mostrar éxito
    setMensaje('✅ Puntos guardados con éxito');

    // Esperar 2 segundos y volver a Misiones
    setTimeout(() => {
      window.location.href = '/misiones';
    }, 2000);
  } else {
    // Mostrar error pero permitir volver de todas formas
    setMensaje('⚠️ Error al guardar (intenta de nuevo o vuelve a Misiones)');

    // Botón para volver sin guardar (fallback)
    console.warn('Puntos no se guardaron. Usuario puede volver igualmente.');
  }
};


export { guardarPuntosEnServidor, guardarPuntosConReintentos };
