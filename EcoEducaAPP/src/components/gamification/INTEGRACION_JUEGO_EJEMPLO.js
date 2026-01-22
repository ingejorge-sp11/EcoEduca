/**
 * 📝 EJEMPLO: Cómo Integrar Guardado de Puntos en JuegoResiduos.jsx
 * 
 * Este archivo muestra dónde y cómo agregar el código para guardar puntos
 * después de que el usuario complete una ronda del juego.
 */

// ============================================================================
// PASO 1: AGREGAR ESTA FUNCIÓN al componente JuegoResiduos
// ============================================================================

const guardarPuntosEnServidor = async (puntosGanados) => {
  const token = localStorage.getItem('token');
  const userIdLocal = localStorage.getItem('userId'); // O usar userId del state

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

// ============================================================================
// PASO 2: LLAMAR ESTA FUNCIÓN cuando el usuario completa el juego
// ============================================================================

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

// ============================================================================
// OPCIÓN B: Si el juego termina automáticamente después de cierto tiempo
// ============================================================================

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

// ============================================================================
// OPCIÓN C: Guardar después de cada acción correcta (más frecuente)
// ============================================================================

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

// ============================================================================
// PASO 3: AGREGAR BOTÓN EN LA INTERFAZ (si no existe)
// ============================================================================

{/* Agregar esto en el JSX del componente */}
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

// ============================================================================
// PASO 4: FLUJO COMPLETO (Ejemplo)
// ============================================================================

/**
 * Flujo completo de ejecución:
 * 
 * 1. Usuario está en GamificationDashboard
 *    └─ Clic en "Ir al Juego de Residuos"
 *       └─ Se abre JuegoResiduos.jsx
 *
 * 2. Usuario juega
 *    ├─ Arrastra objetos a contenedores
 *    ├─ Respuestas correctas = +10 puntos (state local)
 *    └─ Cada respuesta correcta llama manejarRespuestaCorrecta()
 *       └─ guardarPuntosEnServidor(nuevoPuntaje)
 *          └─ POST /api/usuario/{id}/puntos
 *             └─ Backend actualiza usuario.puntuacion
 *
 * 3. Usuario termina el juego
 *    └─ Clic en "Volver a Misiones"
 *       └─ window.location.href = '/misiones'
 *
 * 4. GamificationDashboard recarga
 *    ├─ useEffect se ejecuta
 *    ├─ GET /api/usuario/{id}
 *    ├─ Obtiene puntuacion actualizada (ahora 110 en lugar de 50)
 *    └─ MisionesDiarias se re-renderiza con nuevo valor
 *       └─ Barra de progreso avanza automáticamente
 */

// ============================================================================
// PASO 5: MANEJO DE ERRORES (Importante)
// ============================================================================

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

// ============================================================================
// STEP 6: VERIFICACIÓN Y FEEDBACK AL USUARIO
// ============================================================================

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

// ============================================================================
// RESUMEN
// ============================================================================

/**
 * Tres líneas principales de código a agregar:
 * 
 * 1. Función guardarPuntosEnServidor()
 * 2. Llamada a esta función cuando el juego termina
 * 3. Redirigir a /misiones después
 * 
 * Eso es todo lo necesario para que el sistema de Misiones funcione
 */

export { guardarPuntosEnServidor, guardarPuntosConReintentos };
