import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Target, Calendar } from "lucide-react";

const MisionesDiarias = ({ user, puntosActuales }) => {
  const [misiones, setMisiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaActual, setFechaActual] = useState(new Date().toLocaleDateString("es-ES"));
  const [trigger, setTrigger] = useState(0); 

  // Función para obtener la clave de progreso por usuario
  const getProgresoKey = () => {
    return user && user.id ? `misiones_diarias_${user.id}` : 'misiones_diarias';
  };

  // Función para cargar misiones
  const cargarMisiones = async () => {
    const hoy = new Date().toLocaleDateString('es-ES');
    const hoyISO = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
    let progreso = JSON.parse(localStorage.getItem(getProgresoKey())) || {};
    // Si la fecha guardada no es hoy, reiniciar progreso diario
    if (progreso.fecha !== hoy) {
      progreso = { fecha: hoy };
      localStorage.setItem(getProgresoKey(), JSON.stringify(progreso));
    }

    // Validar misión de reporte consultando la API
    let reporteCompletado = false;
    if (user && user.id) {
      try {
        // Endpoint que devuelve los reportes del usuario (puede devolver varios días)
        const res = await fetch(`/api/reportes?usuario_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          // Filtrar reportes por fecha_reporte igual a hoy y estado 'aprobado'
          const hoyISO = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
          const reportesHoy = Array.isArray(data)
            ? data.filter(r => {
                // Normaliza fecha_reporte a yyyy-mm-dd
                const fecha = r.fecha_reporte ? r.fecha_reporte.slice(0, 10) : '';
                // Solo cuenta si el usuario_id es igual al usuario actual
                const usuarioOk = r.usuario_id === user.id || r.usuario_id === String(user.id);
                // Acepta estado 'aprobado', 'activo' o 'pendiente'
                return usuarioOk && fecha === hoyISO && ['aprobado', 'activo', 'pendiente'].includes(r.estado);
              })
            : [];
          reporteCompletado = reportesHoy.length > 0;
        } else {
          reporteCompletado = false;
        }
      } catch (e) {
        reporteCompletado = false;
      }
    } else {
      reporteCompletado = false;
    }

    const misionesHoy = [
      {
        id: 1,
        titulo: "Reporta un incidente",
        descripcion: "Haz un reporte de incidencia ambiental hoy",
        puntos: 30,
        icono: "🚨",
        tipo: "reporte",
        completada: reporteCompletado,
      },
      {
        id: 2,
        titulo: "Clasificador experto",
        descripcion: "Consigue 80 puntos en el juego de residuos",
        puntos: 50,
        icono: "♻️",
        tipo: "juego-residuos",
        completada: (Number(localStorage.getItem(`residuos_puntos_${hoyISO}_u${user?.id ?? 'anon'}`)) || 0) >= 80,
      },
      {
        id: 3,
        titulo: "Reciclador avanzado",
        descripcion: "Consigue 25 puntos en el juego de proceso de reciclaje",
        puntos: 40,
        icono: "🏭",
        tipo: "juego-reciclaje",
        completada: (Number(localStorage.getItem(`reciclaje_puntos_${hoyISO}_u${user?.id ?? 'anon'}`)) || 0) >= 25,
      },
      {
        id: 4,
        titulo: "Tira una basura correctamente",
        descripcion: "Coloca correctamente una basura en el juego de residuos",
        puntos: 20,
        icono: "🗑️",
        tipo: "accion-residuo",
        completada: progreso.basura_correcta === hoy,
      },
    ];
    // Sumar puntos automáticamente si alguna misión completada no está sumada
    let puntosTotales = progreso.puntos_totales || 0;
    let actualizados = false;
    if (misionesHoy[0].completada && (!progreso._sumado_reporte)) {
      puntosTotales += misionesHoy[0].puntos;
      progreso._sumado_reporte = true;
      actualizados = true;
    }
    if (misionesHoy[1].completada && (!progreso._sumado_residuos)) {
      puntosTotales += misionesHoy[1].puntos;
      progreso._sumado_residuos = true;
      actualizados = true;
    }
    if (misionesHoy[2].completada && (!progreso._sumado_reciclaje)) {
      puntosTotales += misionesHoy[2].puntos;
      progreso._sumado_reciclaje = true;
      actualizados = true;
    }
    if (misionesHoy[3].completada && (!progreso._sumado_basura)) {
      puntosTotales += misionesHoy[3].puntos;
      progreso._sumado_basura = true;
      actualizados = true;
    }
    if (actualizados) {
      progreso.puntos_totales = puntosTotales;
      localStorage.setItem(getProgresoKey(), JSON.stringify(progreso));
      try {
        window.dispatchEvent(new Event('ecoedu:puntos-misiones-actualizados'));
      } catch (e) {
        // ignorar errores en entornos sin window
      }
    }
    setMisiones(misionesHoy);
    setLoading(false);
  };

  useEffect(() => {
    cargarMisiones();
    // Escuchar cambios en localStorage (de otras pestañas)
    const onStorage = (e) => {
      if (
        e.key && (
          e.key.startsWith('misiones_diarias') ||
          e.key.startsWith('residuos_puntos_') ||
          e.key.startsWith('reciclaje_puntos_')
        )
      ) {
        setTrigger(t => t + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  // Recargar misiones cuando trigger cambie
  useEffect(() => {
    cargarMisiones();
  }, [trigger, user]);

  // Reiniciar automáticamente cuando cambie el día
  useEffect(() => {
    const checkDateChange = () => {
      const hoy = new Date().toLocaleDateString('es-ES');
      if (hoy !== fechaActual) {
        setFechaActual(hoy);
        setTrigger(t => t + 1);
      }
    };
    const intervalId = setInterval(checkDateChange, 60000);
    return () => clearInterval(intervalId);
  }, [fechaActual]);

  // Render principal
  return (
    <>
      <div className="w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Misiones Diarias</h2>
                <p className="text-sm text-gray-600">{fechaActual}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Puntos totales hoy</p>
              <p className="text-3xl font-bold text-yellow-600">+{JSON.parse(localStorage.getItem(getProgresoKey()))?.puntos_totales || 0}</p>
            </div>
          </div>
        </div>
        {/* Lista de misiones */}
        <div className="grid gap-6">
          {misiones.map((mision) => (
            <motion.div
              key={mision.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-lg border-2 transition-all ${
                mision.completada
                  ? "bg-green-50 border-green-400"
                  : "bg-white border-gray-300 hover:border-green-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                  <span className="text-4xl">{mision.icono}</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-xl text-gray-800">{mision.titulo}</h3>
                      <p className="text-gray-600 mt-1">{mision.descripcion}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {mision.completada ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                          <CheckCircle2 size={32} className="text-green-500" fill="currentColor" />
                        </motion.div>
                      ) : (
                        <Circle size={32} className="text-gray-300" strokeWidth={1.5} />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    {mision.completada ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-green-100 border border-green-400 rounded-lg text-green-700 font-semibold">
                        <CheckCircle2 size={20} />
                        ✅ ¡Misión Completada! Ganaste +{mision.puntos} puntos
                      </motion.div>
                    ) : (
                      <motion.div animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 2, repeat: Infinity }} className="flex items-center gap-2 p-3 bg-blue-100 border border-blue-400 rounded-lg text-blue-700 font-semibold">
                        <Zap size={20} />
                        Completa la misión para ganar +{mision.puntos} puntos
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Instrucciones */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-2 font-semibold">📖 Cómo completar:</p>
          <ol className="text-sm text-gray-700 space-y-1 ml-4">
            <li>1. Reporta un incidente ambiental</li>
            <li>2. Juega y consigue puntos en los juegos</li>
            <li>3. Tira una basura correctamente en el juego de residuos</li>
            <li>4. ¡Completa todas las misiones para ganar más puntos!</li>
          </ol>
        </motion.div>
       
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm text-gray-700 font-semibold">📅 Mañana tendrás nuevas misiones</p>
          <p className="text-xs text-gray-600 mt-1">Las misiones cambian diariamente. Completa todas para ganar más puntos</p>
        </motion.div>
      </div>
    </>
  );
};

export default MisionesDiarias;
                        
