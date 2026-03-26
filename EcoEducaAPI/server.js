import express from 'express';
import pg from 'pg'; // Cliente de PostgreSQL
import dotenv from 'dotenv'; //Carga variables de entorno desde un archivo
import bcrypt from 'bcrypt'; // Librería para cifrar/hashear contraseñas
import jwt from 'jsonwebtoken';//autenticación basada en tokens
import cors from 'cors'; //Middleware que habilita CORS
import axios from 'axios'; //peticiones a otros servicios/APIs externas
import dns from 'dns';
import { supabase } from './supabaseClient.js';

dns.setDefaultResultOrder('ipv4first');

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Clave secreta para firmar y verificar JWT
const jwtSecret = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

// Configuración de JWT y puntos
const PUNTOS_POR_ACIERTO = Number(process.env.PUNTOS_POR_ACIERTO) || 10; //Define una constante de puntos por acierto para el sistema de gamificación.

// Inicializar la aplicación de Express
const app = express();
const port = 3002;

app.use(cors()); // Habilita CORS para permitir peticiones desde el frontend
app.use(express.json()); // Permite al servidor entender JSON en las peticiones

// Configuración de la conexión a la base de datos PostgreSQL 
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Verificamos la conexión a la base de datos al iniciar (no bloqueante)
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar con la base de datos PostgreSQL (pool):', err.stack);
    return;
  }
  client.query('SELECT NOW()', (err) => {
    release();
    if (err) {
      console.error('Error ejecutando la consulta de prueba en PostgreSQL:', err.stack);
    } else {
      console.log('¡Conexión exitosa a la base de datos PostgreSQL!');
    }
  });
});

// Endpoint de prueba para verificar conexión con Supabase vía REST
app.get('/api/supabase/health', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({
        ok: false,
        message: 'Supabase no está configurado. Revisa SUPABASE_URL y claves en .env.'
      });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error al consultar Supabase:', error.message);
      return res.status(500).json({ ok: false, message: 'Error al consultar Supabase', error: error.message });
    }

    return res.json({ ok: true, message: 'Conexión a Supabase OK', sample: data });
  } catch (e) {
    console.error('Error en /api/supabase/health:', e);
    res.status(500).json({ ok: false, message: 'Error interno al consultar Supabase', error: String(e?.message || e) });
  }
});

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- MIDDLEWARE DE SEGURIDAD ---
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acceso denegado.' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    if (!user || user.rol !== 'admin') {
      return res.status(403).json({ message: 'Requiere permisos de administrador.' });
    }
    req.user = user;
    next();
  });
};
// --- RUTAS DE LA API ---
// Obtener datos de un usuario por ID 
app.get('/api/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, codigo_estudiante, puntuacion FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Tabla de posiciones, obtiene la puntuacion combinada de ambos juegos y los ordena descendentemente, limitando al top 6 (Supabase)
//Despues de eso, te dice cual es la posicion que ocupa el usuario 
app.get('/api/v1/leaderboard/top6', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const userId = req.user?.id;

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id, nombre, puntuacion, puntuacion_segundo');

    if (error) {
      console.error('Error al obtener usuarios para leaderboard (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener leaderboard' });
    }

    const lista = (usuarios || []).map(u => ({
      id: u.id,
      nombre: u.nombre,
      puntuacion: u.puntuacion || 0,
      puntuacion_segundo: u.puntuacion_segundo || 0,
      total: (u.puntuacion || 0) + (u.puntuacion_segundo || 0)
    }));

    lista.sort((a, b) => b.total - a.total);

    const top = lista.slice(0, 6);
    const indexUsuario = lista.findIndex(u => u.id === userId);
    const currentUser = indexUsuario >= 0 ? { ...lista[indexUsuario], rank: indexUsuario + 1 } : null;

    res.json({ top, currentUser });
  } catch (error) {
    console.error('Error al obtener leaderboard combinado:', error);
    res.status(500).json({ message: 'Error al obtener leaderboard' });
  }
});

// Validar año, lo emplea varios elementos que reciben de paraemtro el año, y aseguran que contiene 4 digitos y dentro del rango razonable
function validarAño(año) {
  const regex = /^\d{4}$/;
  return regex.test(año) && año >= 2020 && año <= 2100;
}

// Validar cantidad de residuos, asegura que el numero es entero positivo.
function validarCantidad(cantidad) {
  const num = parseInt(cantidad);
  return !isNaN(num) && num > 0 && num <= 50;
}

// Registro del usuario
app.post('/api/register', async (req, res) => {
  const { nombre, apellido, codigo, password } = req.body;

  if (!nombre || !apellido || !codigo || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado en el servidor.' });
    }

    //Se genera un hash y usa bcrypt para encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          apellido,
          codigo_estudiante: codigo,
          password_hash: hashedPassword,
          puntuacion: 0,
          nivel: 0,
        }
      ])
      .select('id, nombre, codigo_estudiante, puntuacion, nivel')
      .single();

    if (error) {
      console.error('Error en el registro (Supabase):', error);
      // 23505 suele ser clave duplicada en Postgres
      if (error.code === '23505') {
        return res.status(409).json({ message: 'El código de estudiante ya está registrado.' });
      }
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    res.status(201).json({ message: 'Usuario registrado con éxito', user: data });
  } catch (error) {
    console.error('Error inesperado en el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST login (legacy)
app.post('/api/login', async (req, res) => {
  const { codigo, password } = req.body;

  if (!codigo || !password) {
    return res.status(400).json({ message: 'El código y la contraseña son obligatorios.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado en el servidor.' });
    }

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('codigo_estudiante', codigo)
      .maybeSingle();

    if (error) {
      console.error('Error obteniendo usuario en login (Supabase):', error);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
    }

    const payload = {
      id: user.id,
      nombre: user.nombre,
      codigo: user.codigo_estudiante,
      puntuacion: user.puntuacion,
      rol: user.rol || 'user'
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '2h' });

    res.json({ message: 'Inicio de sesión exitoso', token, user: payload });

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Endpoint para obtener un consejo aleatorio
app.get('/api/consejo-aleatorio', async (req, res) => {
  try {
    const result = await pool.query('SELECT descripcion FROM consejos ORDER BY RANDOM() LIMIT 1');
    if (result.rows.length > 0) {
      res.json({ descripcion: result.rows[0].descripcion });
    } else {
      res.status(404).json({ descripcion: "No hay consejos disponibles." });
    }
  } catch (error) {
    console.error('Error al obtener consejo:', error);
    res.status(500).json({ descripcion: "Error al obtener consejo." });
  }
});

// Middleware de autenticación proteger rutas que requieren usuario logueado.
//El servidor usa una clave secreta àra verificar ñps tokens JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  console.log('--- authenticateToken ---');
  console.log('Authorization header:', authHeader);
  console.log('Token extraído:', token);
  if (!token) {
    console.log('No se proporcionó token');
    return res.status(401).json({ message: 'Token no proporcionado.' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('Token inválido:', err);
      return res.status(403).json({ message: 'Token inválido.' });
    }
    console.log('Payload decodificado del token:', user);
    req.user = user;
    next();
  });
}

// Obtener datos del usuario autenticado (incluye puntuacion) usando Supabase
app.get('/api/v1/users/profile', authenticateToken, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    let { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, codigo_estudiante, puntuacion, puntuacion_segundo, nivel')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Error usando nivel en /v1/users/profile, intentando fallback sin nivel:', error.message);
      const fallback = await supabase
        .from('usuarios')
        .select('id, nombre, codigo_estudiante, puntuacion, puntuacion_segundo')
        .eq('id', req.user.id)
        .maybeSingle();

      if (fallback.error) {
        console.error('Error en fallback /v1/users/profile:', fallback.error.message);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }
      if (!fallback.data) return res.status(404).json({ message: 'Usuario no encontrado.' });

      return res.json({ ...fallback.data, nivel: 0 });
    }
    if (!data) return res.status(404).json({ message: 'Usuario no encontrado.' });

    res.json(data);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// GET obtiene los datos del usuario logueado (incluye nivel acumulado de misiones)
app.get('/api/usuarios/me', authenticateToken, async (req, res) => {
  try {
    console.log('--- /api/usuarios/me ---');
    console.log('req.user:', req.user);
    if (!req.user || !req.user.id) {
      console.log('req.user o req.user.id no definido');
      return res.status(400).json({ message: 'Token sin id de usuario.' });
    }

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error al obtener usuario en /api/usuarios/me (Supabase):', error.message);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    if (!data) {
      console.log('Usuario no encontrado en la base de datos');
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const nivelSeguro = Number(data.nivel || 0);
    res.json({
      ...data,
      nivel: isNaN(nivelSeguro) ? 0 : nivelSeguro,
    });
  } catch (err) {
    console.error('Error al obtener usuario en /api/usuarios/me:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Lee los puntos de la bd para dibujarlos en el mapa (Supabase)
app.get('/api/mapa', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }
    const { data, error } = await supabase.from('puntos_mapa').select('*');
    if (error) {
      console.error('Error al obtener mapa (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener mapa' });
    }
    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener mapa:', error);
    res.status(500).json({ message: 'Error al obtener mapa' });
  }
});

// Mapa de alias de ubicaciones a coordenadas "lat,lng".
// Aquí se configuran los módulos de CUCEI: el texto que
// escriba el usuario (normalizado a minúsculas) se mapea
// a las coordenadas correspondientes.
const LOCATION_ALIAS_TO_COORDS = {
  // Módulo A
  'modulo a': '20.654078,-103.325756',
  'edificio a': '20.654078,-103.325756',
  'a': '20.654078,-103.325756',

  // Módulo B
  'modulo b': '20.654008,-103.324911',
  'edificio b': '20.654008,-103.324911',
  'b': '20.654008,-103.324911',

  // Módulo C
  'modulo c': '20.654206,-103.325009',
  'edificio c': '20.654206,-103.325009',
  'c': '20.654206,-103.325009',

  // Módulo D
  'modulo d': '20.654482,-103.325288',
  'edificio d': '20.654482,-103.325288',
  'd': '20.654482,-103.325288',

  // Módulo E
  'modulo e': '20.655566,-103.326154',
  'edificio e': '20.655566,-103.326154',
  'e': '20.655566,-103.326154',

  // Módulo F
  'modulo f': '20.655892,-103.325947',
  'edificio f': '20.655892,-103.325947',
  'f': '20.655892,-103.325947',

  // Módulo G
  'modulo g': '20.655901,-103.326994',
  'edificio g': '20.655901,-103.326994',
  'g': '20.655901,-103.326994',

  // Módulo H
  'modulo h': '20.65603,-103.326377',
  'edificio h': '20.65603,-103.326377',
  'h': '20.65603,-103.326377',

  // Módulo I
  'modulo i': '20.656076,-103.325599',
  'edificio i': '20.656076,-103.325599',
  'i': '20.656076,-103.325599',

  // Módulo J
  'modulo j': '20.656223,-103.325931',
  'edificio j': '20.656223,-103.325931',
  'j': '20.656223,-103.325931',

  // Módulo K
  'modulo k': '20.656389,-103.325927',
  'edificio k': '20.656389,-103.325927',
  'k': '20.656389,-103.325927',

  // Módulo L
  'modulo l': '20.6568,-103.325177',
  'edificio l': '20.6568,-103.325177',
  'l': '20.6568,-103.325177',

  // Módulo M
  'modulo m': '20.656632,-103.326352',
  'edificio m': '20.656632,-103.326352',
  'm': '20.656632,-103.326352',

  // Módulo N
  'modulo n': '20.656966,-103.326001',
  'edificio n': '20.656966,-103.326001',
  'n': '20.656966,-103.326001',

  // Módulo O
  'modulo o': '20.657163,-103.326125',
  'edificio o': '20.657163,-103.326125',
  'o': '20.657163,-103.326125',

  // Módulo P
  'modulo p': '20.657356,-103.325111',
  'edificio p': '20.657356,-103.325111',
  'p': '20.657356,-103.325111',

  // Módulo Q
  'modulo q': '20.657621,-103.324778',
  'edificio q': '20.657621,-103.324778',
  'q': '20.657621,-103.324778',

  // Módulo R
  'modulo r': '20.657633,-103.325707',
  'edificio r': '20.657633,-103.325707',
  'r': '20.657633,-103.325707',

  // Módulo S
  'modulo s': '20.657646,-103.326324',
  'edificio s': '20.657646,-103.326324',
  's': '20.657646,-103.326324',

  // Módulo T
  'modulo t': '20.657885,-103.325434',
  'edificio t': '20.657885,-103.325434',
  't': '20.657885,-103.325434',

  // Módulo U
  'modulo u': '20.658117,-103.325266',
  'edificio u': '20.658117,-103.325266',
  'u': '20.658117,-103.325266',

  // Módulo V
  'modulo v': '20.658298,-103.326457',
  'edificio v': '20.658298,-103.326457',
  'v': '20.658298,-103.326457',

  // Módulo V2
  'modulo v2': '20.658126,-103.326021',
  'edificio v2': '20.658126,-103.326021',
  'v2': '20.658126,-103.326021',

  // Módulo W
  'modulo w': '20.658061,-103.327009',
  'edificio w': '20.658061,-103.327009',
  'w': '20.658061,-103.327009',

  // Módulo X
  'modulo x': '20.658278,-103.326799',
  'edificio x': '20.658278,-103.326799',
  'x': '20.658278,-103.326799',

  // Módulo Y
  'modulo y': '20.657205,-103.327172',
  'edificio y': '20.657205,-103.327172',
  'y': '20.657205,-103.327172',

  // Módulo Z
  'modulo z': '20.657387,-103.327804',
  'edificio z': '20.657387,-103.327804',
  'z': '20.657387,-103.327804',
};

// Normaliza la ubicación: si coincide con un alias (por texto),
// devuelve sus coordenadas; si no, deja el valor tal cual.
function mapUbicacionToCoords(ubicacionRaw) {
  if (!ubicacionRaw || typeof ubicacionRaw !== 'string') return ubicacionRaw;

  // Normalizar texto: recortar espacios, pasar a minúsculas
  // y quitar acentos (módulo -> modulo) para que coincida
  // aunque el usuario escriba con tildes.
  const key = ubicacionRaw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return LOCATION_ALIAS_TO_COORDS[key] || ubicacionRaw;
}

// GET  leer todos los reportes desde la BD (Supabase)
app.get('/api/reportes', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha_reporte', { ascending: false });

    if (error) {
      console.error('Error al obtener reportes (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener reportes' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
});
// crear/enviar un nuevo reporte (Supabase)
app.post('/api/reportes', async (req, res) => {
  const { usuario_id, titulo, descripcion, tipo, ubicacion } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    // Si el usuario escribió un alias como "Modulo P",
    // lo convertimos a coordenadas definidas en LOCATION_ALIAS_TO_COORDS.
    const ubicacionProcesada = mapUbicacionToCoords(ubicacion);

    const { error } = await supabase.from('reportes').insert([
      { usuario_id, titulo, descripcion, tipo, ubicacion: ubicacionProcesada }
    ]);

    if (error) {
      console.error('Error al enviar reporte (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al enviar reporte.' });
    }

    res.status(201).json({ message: 'Reporte enviado.' });
  } catch (e) {
    console.error('Error al enviar reporte:', e);
    res.status(500).json({ message: 'Error al enviar reporte.' });
  }
});

// Obtiene fechas de la base de datos para ponerlas en el calendario (Supabase)
app.get('/api/fechas-importantes', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('fechas_importantes')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error al obtener fechas importantes (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener fechas importantes' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener fechas importantes:', error);
    res.status(500).json({ message: 'Error al obtener fechas importantes' });
  }
});

// ---PANEL DE ADMINISTRADOR ---
// 1. Estadisticas geenrales de los totales de reportes, susuarios, eventos
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const [{ count: reportesPendientes, error: errRep }, { count: usuariosTotales, error: errUsr }, { count: eventosActivos, error: errEvt }] = await Promise.all([
      supabase.from('reportes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
      supabase.from('usuarios').select('*', { count: 'exact', head: true }),
      supabase.from('eventos').select('*', { count: 'exact', head: true })
    ]);

    if (errRep || errUsr || errEvt) {
      console.error('Error en stats (Supabase):', errRep || errUsr || errEvt);
      return res.status(500).json({ message: 'Error en stats' });
    }

    res.json({
      reportesPendientes: reportesPendientes ?? 0,
      usuariosTotales: usuariosTotales ?? 0,
      eventosActivos: eventosActivos ?? 0
    });
  } catch (e) { res.status(500).json({ message: 'Error en stats' }); }
});

// 2. Gestión de Reportes
app.get('/api/admin/reportes', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    // Traer todos los campos tal como están en la tabla, ordenados por fecha más reciente
    const { data, error } = await supabase
      .from('reportes')
      .select('*')
      .order('fecha_reporte', { ascending: false });

    if (error) {
      console.error('Error obteniendo reportes (Supabase admin):', error.message);
      return res.status(500).json({ message: 'Error obteniendo reportes' });
    }

    res.json(data || []);
  } catch (e) {
    console.error('Error obteniendo reportes (admin):', e);
    res.status(500).json({ message: 'Error obteniendo reportes' });
  }
});
app.put('/api/admin/reportes/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { error } = await supabase
      .from('reportes')
      .update({ estado })
      .eq('id', id);

    if (error) {
      console.error('Error actualizando reporte (Supabase admin):', error.message);
      return res.status(500).json({ message: 'Error actualizando reporte' });
    }

    res.json({ message: 'Estado actualizado' });
  } catch (e) {
    console.error('Error actualizando reporte (admin):', e);
    res.status(500).json({ message: 'Error actualizando reporte' });
  }
});

// 3. Gestión de Eventos
app.post('/api/admin/eventos', verifyAdmin, async (req, res) => {
  const { titulo, descripcion, fecha, hora, ubicacion } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { error } = await supabase.from('eventos').insert([
      { titulo, descripcion, fecha, hora, ubicacion }
    ]);

    if (error) {
      console.error('Error creando evento (Supabase):', error.message);
      return res.status(500).json({ message: 'Error creando evento' });
    }

    res.status(201).json({ message: 'Evento creado' });
  } catch (e) {
    console.error('Error creando evento (admin):', e);
    res.status(500).json({ message: 'Error creando evento' });
  }
});

app.put('/api/admin/eventos/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, hora, ubicacion } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('eventos')
      .update({ titulo, descripcion, fecha, hora, ubicacion })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error actualizando evento (Supabase admin):', error.message);
      return res.status(500).json({ message: 'Error actualizando evento' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Evento no encontrado.' });
    }

    res.json({
      message: 'Evento actualizado',
      evento: {
        id: data.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        fecha: data.fecha,
        hora: data.hora,
        ubicacion: data.ubicacion
      }
    });
  } catch (e) {
    console.error('Error actualizando evento (admin):', e);
    res.status(500).json({ message: 'Error actualizando evento' });
  }
});
app.delete('/api/admin/eventos/:id', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { error } = await supabase.from('eventos').delete().eq('id', req.params.id);

    if (error) {
      console.error('Error eliminando evento (Supabase):', error.message);
      return res.status(500).json({ message: 'Error eliminando evento' });
    }

    res.json({ message: 'Evento eliminado' });
  } catch (e) { res.status(500).json({ message: 'Error eliminando evento' }); }
});

// 4. Gestión de Novedades (Supabase)
function normalizarFechaPublicacion(fechaRaw) {
  try {
    if (!fechaRaw) {
      return new Date().toISOString().slice(0, 10);
    }

    const valor = String(fechaRaw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return valor;
    }

    // Formato común en español: DD/MM/YYYY
    const matchDMY = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor);
    if (matchDMY) {
      const [, dd, mm, yyyy] = matchDMY;
      return `${yyyy}-${mm}-${dd}`;
    }

    // Intentar parseo genérico
    const d = new Date(valor);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }

    // Si todo falla, usar la fecha actual para evitar errores de formato
    return new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

app.post('/api/admin/novedades', verifyAdmin, async (req, res) => {
  const { titulo, resumen, fecha_publicacion } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const fechaIso = normalizarFechaPublicacion(fecha_publicacion);

    const { data, error } = await supabase
      .from('novedades')
      .insert([{ titulo, resumen, fecha_publicacion: fechaIso }])
      .select('id, titulo, resumen, fecha_publicacion, visible')
      .maybeSingle();

    if (error) {
      console.error('Error creando noticia (Supabase admin):', error.message, 'detalle:', error.details);
      return res.status(500).json({ message: 'Error creando noticia', error: error.message });
    }

    res.status(201).json({ message: 'Noticia creada', novedad: data });
  } catch (e) {
    console.error('Error creando noticia (admin):', e);
    res.status(500).json({ message: 'Error creando noticia' });
  }
});

app.put('/api/admin/novedades/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { titulo, resumen, fecha_publicacion } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const fechaIso = normalizarFechaPublicacion(fecha_publicacion);

    const { data, error } = await supabase
      .from('novedades')
      .update({ titulo, resumen, fecha_publicacion: fechaIso })
      .eq('id', id)
      .select('id, titulo, resumen, fecha_publicacion, visible')
      .maybeSingle();

    if (error) {
      console.error('Error actualizando noticia (Supabase admin):', error.message);
      return res.status(500).json({ message: 'Error actualizando noticia' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Noticia no encontrada.' });
    }

    res.json({ message: 'Noticia actualizada', novedad: data });
  } catch (e) {
    console.error('Error actualizando noticia (admin):', e);
    res.status(500).json({ message: 'Error actualizando noticia' });
  }
});

app.delete('/api/admin/novedades/:id', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { error } = await supabase
      .from('novedades')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error eliminando noticia (Supabase admin):', error.message);
      return res.status(500).json({ message: 'Error eliminando noticia' });
    }

    res.json({ message: 'Noticia eliminada' });
  } catch (e) {
    console.error('Error eliminando noticia (admin):', e);
    res.status(500).json({ message: 'Error eliminando noticia' });
  }
});

// 5. Verifica que el usuario sea administrador
app.get('/api/admin/me', verifyAdmin, (req, res) => {
  res.json({ admin: true, user: req.user });
});

// 5. Gestión de Mapa (Supabase)
app.post('/api/admin/mapa', verifyAdmin, async (req, res) => {
  const { nombre, descripcion, latitud, longitud, categoria } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const lat = latitud !== undefined ? parseFloat(latitud) : null;
    const lng = longitud !== undefined ? parseFloat(longitud) : null;

    const { data, error } = await supabase
      .from('puntos_mapa')
      .insert([
        {
          nombre,
          descripcion,
          latitud: lat,
          longitud: lng,
          categoria,
        },
      ])
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error creando punto (Supabase admin):', error.message, 'detalle:', error.details);
      return res.status(500).json({ message: 'Error creando punto', error: error.message });
    }
  } catch (e) {
    console.error('Error creando punto (admin):', e);
    res.status(500).json({ message: 'Error creando punto' });
  }
});

app.put('/api/admin/mapa/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, latitud, longitud, categoria } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const lat = latitud !== undefined ? parseFloat(latitud) : null;
    const lng = longitud !== undefined ? parseFloat(longitud) : null;

    const { data, error } = await supabase
      .from('puntos_mapa')
      .update({
        nombre,
        descripcion,
        latitud: lat,
        longitud: lng,
        categoria,
      })
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error actualizando punto (Supabase admin):', error.message, 'detalle:', error.details);
      return res.status(500).json({ message: 'Error actualizando punto', error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: 'Punto no encontrado.' });
    }

    res.json({ message: 'Punto actualizado', punto: data });
  } catch (e) {
    console.error('Error actualizando punto (admin):', e);
    res.status(500).json({ message: 'Error actualizando punto' });
  }
});

app.delete('/api/admin/mapa/:id', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { error } = await supabase
      .from('puntos_mapa')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error eliminando punto (Supabase admin):', error.message, 'detalle:', error.details);
      return res.status(500).json({ message: 'Error eliminando punto', error: error.message });
    }

    res.json({ message: 'Punto eliminado' });
  } catch (e) {
    console.error('Error eliminando punto (admin):', e);
    res.status(500).json({ message: 'Error eliminando punto' });
  }
});

// 6. Analítica de Mapa (K-Means)
//   Su objetivo es generar un heatmap inteligente que ayude a los administradores a detectar áreas críticas 
// o recurrentes dentro del campus y priorizar acciones de mantenimiento o atención.
//Define un endpoint GET que solo pueden usar administradores
app.get('/api/admin/analytics/heatmap', verifyAdmin, async (req, res) => {
  try {
    //Lee parámetros enviados en la URL( Dias y numero de clusters)
    const now = new Date();
    const daysParam = parseInt(req.query.days, 10);
    const kParam = parseInt(req.query.k, 10);

    //Luego se establecen límites
    const days = Number.isNaN(daysParam) || daysParam <= 0 ? 30 : Math.min(daysParam, 365);
    let k = Number.isNaN(kParam) || kParam <= 0 ? 3 : Math.min(Math.max(kParam, 1), 10);

    // Obtener reportes recientes con ubicación válida
    const result = await pool.query(
      `SELECT id, tipo, estado, ubicacion, fecha_reporte
       FROM reportes
       WHERE ubicacion IS NOT NULL AND ubicacion <> ''
         AND fecha_reporte >= NOW() - INTERVAL '${days} days'`
    );

    const rawRows = result.rows || [];
//Convierte cada reporte en un punto geográfico procesado
    // Parsear ubicacion "lat, lng" y calcular un peso heurístico por reporte
    const nowMs = now.getTime();
    const puntos = rawRows
      .map(r => {
        if (!r.ubicacion) return null;
        const parts = String(r.ubicacion).split(',').map(s => s.trim());
        if (parts.length !== 2) return null;
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

        const fecha = r.fecha_reporte ? new Date(r.fecha_reporte) : null;
        const edadDias = fecha ? Math.max(0, (nowMs - fecha.getTime()) / (1000 * 60 * 60 * 24)) : days;

        // Peso por tipo
        let tipoPeso = 1;
        const tipo = (r.tipo || '').toLowerCase();
        if (tipo.includes('fuga')) tipoPeso = 3;
        else if (tipo.includes('electric')) tipoPeso = 2.5;
        else if (tipo.includes('basura')) tipoPeso = 2;

        // Peso por estado
        let estadoPeso = 1;
        const estado = (r.estado || '').toLowerCase();
        if (estado === 'pendiente') estadoPeso = 1.5;
        else if (estado === 'activo') estadoPeso = 1.3;
        else if (estado === 'aprobado' || estado === 'cerrado' || estado === 'resuelto') estadoPeso = 0.8;

        // Peso por recencia (más reciente, más peso)
        const recencyFactor = 1 + Math.max(0, (days - edadDias)) / Math.max(days, 1);

        const weight = tipoPeso * estadoPeso * recencyFactor;

        return {
          id: r.id,
          lat,
          lng,
          tipo: r.tipo,
          estado: r.estado,
          fecha_reporte: r.fecha_reporte,
          weight
        };
      })
      .filter(Boolean);

    if (puntos.length === 0) {
      return res.json({
        metadata: { k: 0, days, totalReportes: 0, generacion: now.toISOString() },
        clusters: []
      });
    }

    // Ajustar k si hay pocos puntos
    if (puntos.length < k) {
      k = puntos.length;
    }

    // Implementación simple de K-Means sobre lat/lng con pesos
    function distancia2(a, b) {
      const dx = a.lat - b.lat;
      const dy = a.lng - b.lng;
      return dx * dx + dy * dy;
    }

    // Inicializar centroides eligiendo k puntos aleatorios distintos
    const randomIndexes = new Set();
    while (randomIndexes.size < k) {
      randomIndexes.add(Math.floor(Math.random() * puntos.length));
    }
    let centroides = Array.from(randomIndexes).map(idx => ({ lat: puntos[idx].lat, lng: puntos[idx].lng }));

    const maxIter = 20;
    let asignaciones = new Array(puntos.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      let cambiado = false;

      // Asignar cada punto al centroide más cercano
      for (let i = 0; i < puntos.length; i++) {
        let mejorK = 0;
        let mejorDist = Infinity;
        for (let c = 0; c < k; c++) {
          const d2 = distancia2(puntos[i], centroides[c]);
          if (d2 < mejorDist) {
            mejorDist = d2;
            mejorK = c;
          }
        }
        if (asignaciones[i] !== mejorK) {
          asignaciones[i] = mejorK;
          cambiado = true;
        }
      }

      // Recalcular centroides ponderados por peso
      const sumLat = new Array(k).fill(0);
      const sumLng = new Array(k).fill(0);
      const sumW = new Array(k).fill(0);

      for (let i = 0; i < puntos.length; i++) {
        const cl = asignaciones[i];
        const w = puntos[i].weight || 1;
        sumLat[cl] += puntos[i].lat * w;
        sumLng[cl] += puntos[i].lng * w;
        sumW[cl] += w;
      }

      for (let c = 0; c < k; c++) {
        if (sumW[c] > 0) {
          centroides[c] = { lat: sumLat[c] / sumW[c], lng: sumLng[c] / sumW[c] };
        } else {
          // Si un cluster queda vacío, reubicarlo en un punto aleatorio
          const idx = Math.floor(Math.random() * puntos.length);
          centroides[c] = { lat: puntos[idx].lat, lng: puntos[idx].lng };
        }
      }

      if (!cambiado) break; // convergió
    }

    // Construir clusters con estadísticas agregadas
    const clusters = Array.from({ length: k }, (_, idx) => ({
      id: idx,
      center: centroides[idx],
      puntos: [],
      totalWeight: 0,
      tipos: {},
      estados: {},
      maxDistance2: 0
    }));

    for (let i = 0; i < puntos.length; i++) {
      const cl = asignaciones[i];
      const p = puntos[i];
      const cluster = clusters[cl];
      cluster.puntos.push(p);
      cluster.totalWeight += p.weight || 1;

      const tKey = (p.tipo || 'desconocido').toLowerCase();
      cluster.tipos[tKey] = (cluster.tipos[tKey] || 0) + 1;

      const eKey = (p.estado || 'desconocido').toLowerCase();
      cluster.estados[eKey] = (cluster.estados[eKey] || 0) + 1;

      const d2 = distancia2(p, cluster.center);
      if (d2 > cluster.maxDistance2) cluster.maxDistance2 = d2;
    }

    const responseClusters = clusters
      .filter(c => c.puntos.length > 0)
      .map(c => {
        const tipoDominante = Object.entries(c.tipos).sort((a, b) => b[1] - a[1])[0]?.[0] || 'desconocido';
        const estadoDominante = Object.entries(c.estados).sort((a, b) => b[1] - a[1])[0]?.[0] || 'desconocido';

        // Radio aproximado en metros usando distancia euclídea pequeña (campus)
        const radiusMeters = Math.sqrt(c.maxDistance2) * 111_000; // ~111km por grado

        return {
          id: c.id,
          center: c.center,
          size: c.puntos.length,
          totalWeight: c.totalWeight,
          avgWeight: c.totalWeight / Math.max(c.puntos.length, 1),
          tipoDominante,
          estadoDominante,
          tipos: c.tipos,
          estados: c.estados,
          radiusMeters,
          // Recortar detalles de puntos para payload moderado
          puntos: c.puntos.slice(0, 100).map(p => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng,
            tipo: p.tipo,
            estado: p.estado,
            fecha_reporte: p.fecha_reporte,
            weight: p.weight
          }))
        };
      })
      .sort((a, b) => b.totalWeight - a.totalWeight);

    res.json({
      metadata: {
        k: responseClusters.length,
        days,
        totalReportes: puntos.length,
        generacion: now.toISOString()
      },
      clusters: responseClusters
    });
  } catch (error) {
    console.error('Error en /api/admin/analytics/heatmap:', error);
    res.status(500).json({ message: 'Error al calcular analítica de mapa' });
  }
});


// POST guardar puntaje solo commprueba el total obtenido y el actual, y si es mayor, el puntaje se cambia en la bd.
app.post('/api/usuarios/me/guardar-mejor-puntaje', authenticateToken, async (req, res) => {
  const { puntos } = req.body;
  const userId = req.user?.id;

  if (typeof puntos !== 'number' || puntos < 0) {
    return res.status(400).json({ message: 'El campo "puntos" debe ser un número no negativo.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data: userData, error: fetchError } = await supabase
      .from('usuarios')
      .select('puntuacion')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al obtener puntuacion (Supabase):', fetchError.message);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
    if (!userData) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const puntuacionActual = userData.puntuacion || 0;

    let nuevaPuntuacion = puntuacionActual;
    if (puntos > puntuacionActual) {
      const { data: updated, error: updateError } = await supabase
        .from('usuarios')
        .update({ puntuacion: puntos })
        .eq('id', userId)
        .select('id, nombre, codigo_estudiante, puntuacion')
        .maybeSingle();

      if (updateError) {
        console.error('Error actualizando puntuacion (Supabase):', updateError.message);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }
      nuevaPuntuacion = updated?.puntuacion ?? puntos;
    }

    res.json({
      message: 'Puntaje procesado',
      puntajeActual: puntuacionActual,
      puntajeNuevo: puntos,
      mejorPuntuacionActual: nuevaPuntuacion,
      actualizado: puntos > puntuacionActual,
      user: { id: userId, puntuacion: nuevaPuntuacion }
    });
  } catch (err) {
    console.error('Error al guardar puntaje:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST agregar puntos de misiones al campo "nivel" del usuario (acumulado global)
app.post('/api/usuarios/me/agregar-puntos-misiones', authenticateToken, async (req, res) => {
  const { puntos } = req.body;
  const userId = req.user?.id;

  const incremento = Number(puntos);
  if (!Number.isFinite(incremento) || incremento <= 0) {
    return res.status(400).json({ message: 'El campo "puntos" debe ser un número positivo.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data: userData, error: fetchError } = await supabase
      .from('usuarios')
      .select('nivel')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al obtener nivel (Supabase):', fetchError.message);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
    if (!userData) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const nivelActual = Number(userData.nivel || 0);
    const nuevoNivel = nivelActual + incremento;

    const { data: updated, error: updateError } = await supabase
      .from('usuarios')
      .update({ nivel: nuevoNivel })
      .eq('id', userId)
      .select('id, nombre, nivel')
      .maybeSingle();

    if (updateError) {
      console.error('Error actualizando nivel (Supabase):', updateError.message);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    res.json({
      message: 'Puntos de misiones agregados',
      incremento,
      nivelAnterior: nivelActual,
      nivelActualizado: updated?.nivel ?? nuevoNivel,
    });
  } catch (err) {
    console.error('Error al agregar puntos de misiones:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST guardar mejor puntaje del juego animado (puntuacion_segundo)
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ message: 'Error global del servidor.', error: err.message });
});
app.post('/api/usuarios/me/guardar-mejor-puntaje-segundo', authenticateToken, async (req, res) => {
  const { puntuacion_segundo } = req.body;
  const userId = req.user?.id;

  if (typeof puntuacion_segundo !== 'number' || puntuacion_segundo < 0) {
    return res.status(400).json({ message: 'El campo "puntuacion_segundo" debe ser un número no negativo.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data: userData, error: fetchError } = await supabase
      .from('usuarios')
      .select('puntuacion_segundo')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error al obtener puntuacion_segundo (Supabase):', fetchError.message);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }
    if (!userData) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const puntuacionActual = userData.puntuacion_segundo || 0;

    let nuevaPuntuacion = puntuacionActual;
    if (puntuacion_segundo > puntuacionActual) {
      const { data: updated, error: updateError } = await supabase
        .from('usuarios')
        .update({ puntuacion_segundo })
        .eq('id', userId)
        .select('id, nombre, codigo_estudiante, puntuacion_segundo')
        .maybeSingle();

      if (updateError) {
        console.error('Error actualizando puntuacion_segundo (Supabase):', updateError.message);
        return res.status(500).json({ message: 'Error interno del servidor.' });
      }
      nuevaPuntuacion = updated?.puntuacion_segundo ?? puntuacion_segundo;
    }

    res.json({
      message: 'Puntaje procesado',
      puntajeActual: puntuacionActual,
      puntajeNuevo: puntuacion_segundo,
      mejorPuntuacionActual: nuevaPuntuacion,
      actualizado: puntuacion_segundo > puntuacionActual,
      user: { id: userId, puntuacion_segundo: nuevaPuntuacion }
    });
  } catch (err) {
    console.error('Error al guardar puntuacion_segundo:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});


//Mostrar novedades, eventos y calendario en el frontend, ordenador por mas reciente.
app.get('/api/v1/content/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM novedades ORDER BY fecha_publicacion DESC');
   //Muestra las novedades
    const novedades = result.rows.map(novedad => ({
        id: novedad.id,
        title: novedad.titulo,
        summary: novedad.resumen,
        date: new Date(novedad.fecha_publicacion).toLocaleDateString('es-MX')
    }));
    res.json(novedades);
  } catch (error) {
    console.error('Error al obtener novedades:', error);
    res.status(500).json({ message: 'Error al obtener novedades' });
  }
});

app.get('/api/v1/content/events', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventos ORDER BY fecha DESC, hora ASC LIMIT 20');
    const eventos = result.rows.map(evento => ({
        id: evento.id,
        title: evento.titulo,
        location: evento.ubicacion,
        date: new Date(evento.fecha).toLocaleDateString('es-MX'),
        time: evento.hora,
        description: evento.descripcion
    }));
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

app.get('/api/v1/content/calendar', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fechas_importantes ORDER BY fecha ASC');
        const calendario = result.rows.map(item => ({
            id: item.id,
            title: item.titulo,
            date: new Date(item.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
        }));
        res.json(calendario);
    } catch (error) {
        console.error('Error al obtener calendario:', error);
        res.status(500).json({ message: 'Error al obtener calendario' });
    }
});


// GET todos los productos (desde Supabase)
app.get('/api/v1/products', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error al obtener productos (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET productos por categoría (desde Supabase)
app.get('/api/v1/products/category/:categoria', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { categoria } = req.params;
    
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ message: 'La categoría no puede estar vacía.' });
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .ilike('categoria', categoria)
      .order('id', { ascending: true })
      .limit(50);

    if (error) {
      console.error('Error al obtener productos por categoría (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'No hay productos en esta categoría.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET productos (ruta usada por el juego, desde Supabase)
app.get('/api/v1/products/random/:cantidad', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { cantidad } = req.params;
    
    if (!validarCantidad(cantidad)) {
      return res.status(400).json({ message: 'La cantidad debe ser un número entre 1 y 50.' });
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: true })
      .limit(parseInt(cantidad));

    if (error) {
      console.error('Error al obtener productos para juego (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error al obtener productos aleatorios:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});


// --- ENDPOINT PARA DÍAS FESTIVOS/AMBIENTALES ---
const diasEspeciales = [
  { date: '2025-04-22', title: 'Día de la Tierra', type: 'ambiental' },
  { date: '2025-05-01', title: 'Día del Trabajo', type: 'nacional' },
  { date: '2025-06-05', title: 'Día Mundial del Medio Ambiente', type: 'ambiental' },
  { date: '2025-12-25', title: 'Navidad', type: 'nacional' },
  { date: '2026-01-01', title: 'Año Nuevo', type: 'nacional' },
  { date: '2026-04-22', title: 'Día de la Tierra', type: 'ambiental' },
  { date: '2026-05-01', title: 'Día del Trabajo', type: 'nacional' },
  { date: '2026-06-05', title: 'Día Mundial del Medio Ambiente', type: 'ambiental' },
  { date: '2026-12-25', title: 'Navidad', type: 'nacional' },
];


// GET novedades para el carrusel solo muestra las que no estan en visibilidad false (Supabase)
app.get('/api/novedades', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('novedades')
      .select('*')
      .order('fecha_publicacion', { ascending: false });

    if (error) {
      console.error('Error al obtener novedades (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener novedades' });
    }

    const rows = data || [];
    const novedades = rows.map(novedad => ({
      id: novedad.id,
      title: novedad.titulo,
      summary: novedad.resumen,
      date: new Date(novedad.fecha_publicacion).toLocaleDateString('es-MX'),
      visible: novedad.visible === undefined ? true : !!novedad.visible
    }));

    res.json(novedades.filter(n => n.visible));
  } catch (error) {
    console.error('Error al obtener novedades:', error);
    res.status(500).json({ message: 'Error al obtener novedades' });
  }
});

// PUT visibilidad de una novedad (mostrar/ocultar en carrusel)
app.put('/api/admin/novedades/:id/visibilidad', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { visible } = req.body;
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    // Normalizar el valor visible aceptando string "true"/"false"
    let vis = visible;
    if (typeof vis === 'string') {
      vis = vis.toLowerCase() === 'true';
    }
    if (typeof vis !== 'boolean') {
      return res.status(400).json({ message: 'El campo "visible" debe ser booleano.' });
    }

    const { data, error } = await supabase
      .from('novedades')
      .update({ visible: vis })
      .eq('id', id)
      .select('id, titulo, resumen, fecha_publicacion, visible')
      .maybeSingle();

    if (error) {
      console.error('Error actualizando visibilidad (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al actualizar visibilidad', error: error.message });
    }
    if (!data) {
      return res.status(404).json({ message: 'Noticia no encontrada.' });
    }

    res.json({ message: 'Visibilidad actualizada', novedad: data });
  } catch (error) {
    console.error('Error actualizando visibilidad:', error);
    res.status(500).json({ message: 'Error al actualizar visibilidad', error: String(error?.message || error) });
  }
});

// Admin: listar todas las novedades sin filtrar visibilidad (Supabase)
app.get('/api/admin/novedades', verifyAdmin, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('novedades')
      .select('*')
      .order('fecha_publicacion', { ascending: false });

    if (error) {
      console.error('Error admin obteniendo novedades (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener novedades admin' });
    }

    const rows = data || [];
    const novedades = rows.map(n => ({
      id: n.id,
      title: n.titulo,
      summary: n.resumen,
      // fecha cruda para edición desde AdminPanel
      fecha_publicacion: n.fecha_publicacion,
      // fecha formateada solo para mostrar en la UI
      date: new Date(n.fecha_publicacion).toLocaleDateString('es-MX'),
      visible: n.visible === undefined ? true : !!n.visible
    }));
    res.json(novedades);
  } catch (error) {
    console.error('Error admin obteniendo novedades:', error);
    res.status(500).json({ message: 'Error al obtener novedades admin' });
  }
});

// GET eventos si acceden a mas informacion se hace los detalles (Supabase)
app.get('/api/eventos', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true })
      .limit(20);

    if (error) {
      console.error('Error al obtener eventos (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al obtener eventos' });
    }

    const eventos = (data || []).map(evento => ({
      id: evento.id,
      title: evento.titulo,
      location: evento.ubicacion,
      date: new Date(evento.fecha).toLocaleDateString('es-MX'),
      time: evento.hora,
      description: evento.descripcion
    }));
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
});

// Convierte una cadena "lat,long" a [lat, lng]
function parseUbicacionToLatLng(ubicacion) {
  if (!ubicacion) return null;
  const parts = String(ubicacion).split(',').map(p => p.trim());
  if (parts.length !== 2) return null;
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

// Implementación ligera de K-Means para coordenadas geográficas
function kmeans(points, k, maxIterations = 25) {
  if (!Array.isArray(points) || points.length === 0 || k <= 0) {
    return [];
  }

  const kClamped = Math.max(1, Math.min(k, points.length));

  // Inicializar centroides de forma determinista para obtener resultados estables
  const sortedPoints = [...points].sort((a, b) => {
    if (a.lat === b.lat) return a.lng - b.lng;
    return a.lat - b.lat;
  });

  const centroids = [];
  const step = sortedPoints.length / kClamped;
  for (let i = 0; i < kClamped; i++) {
    const idx = Math.floor(i * step);
    const p = sortedPoints[idx];
    centroids.push({ lat: p.lat, lng: p.lng });
  }

  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;

    // Asignar cada punto al centroide más cercano
    for (let i = 0; i < points.length; i++) {
      let bestCluster = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dLat = points[i].lat - centroids[c].lat;
        const dLng = points[i].lng - centroids[c].lng;
        const dist = dLat * dLat + dLng * dLng;
        if (dist < bestDist) {
          bestDist = dist;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
    }

    // Recalcular centroides
    const sums = centroids.map(() => ({ lat: 0, lng: 0, count: 0 }));
    for (let i = 0; i < points.length; i++) {
      const clusterIndex = assignments[i];
      const p = points[i];
      sums[clusterIndex].lat += p.lat;
      sums[clusterIndex].lng += p.lng;
      sums[clusterIndex].count += 1;
    }

    for (let c = 0; c < centroids.length; c++) {
      if (sums[c].count > 0) {
        centroids[c].lat = sums[c].lat / sums[c].count;
        centroids[c].lng = sums[c].lng / sums[c].count;
      }
    }

    if (!changed) break; // Convergió
  }

  // Construir clusters con sus puntos
  const clusters = centroids.map((centroid, idx) => ({
    center: [centroid.lat, centroid.lng],
    points: []
  }));

  for (let i = 0; i < points.length; i++) {
    const clusterIndex = assignments[i];
    clusters[clusterIndex].points.push(points[i]);
  }

  return clusters;
}

// Endpoint de analítica: clusters tipo "mapa de calor" basados en reportes
// Solo accesible para administradores (usa verifyAdmin)
app.get('/api/admin/heatmap/reportes', verifyAdmin, async (req, res) => {
  try {
    const daysParam = parseInt(req.query.days, 10);
    const kParam = parseInt(req.query.k, 10);
    const days = Number.isFinite(daysParam) ? Math.min(Math.max(daysParam, 1), 365) : 30;
    const k = Number.isFinite(kParam) ? Math.min(Math.max(kParam, 1), 10) : 4;

    if (!supabase) {
      return res.status(500).json({ message: 'Supabase no está configurado.' });
    }

    // Leer todos los reportes desde Supabase; luego filtramos por ubicación y ventana de días
    const { data: reportes, error } = await supabase
      .from('reportes')
      .select('id, titulo, descripcion, tipo, ubicacion, estado, fecha_reporte');

    if (error) {
      console.error('Error leyendo reportes para heatmap (Supabase):', error.message);
      return res.status(500).json({ message: 'Error al leer reportes para heatmap' });
    }

    const now = Date.now();
    const millisPerDay = 1000 * 60 * 60 * 24;

    const puntosValidos = (reportes || [])
      .map(row => {
        const coords = parseUbicacionToLatLng(row.ubicacion);
        if (!coords) return null;

        const fecha = row.fecha_reporte ? new Date(row.fecha_reporte) : null;
        const ageDays = fecha ? (now - fecha.getTime()) / millisPerDay : null;
        if (ageDays !== null && ageDays > days) return null; // filtrar por ventana de tiempo

        const tipo = row.tipo || 'otro';
        const estado = row.estado || 'pendiente';

        // Ponderaciones sencillas por tipo, estado y recencia
        const severityBase = tipo === 'fuga' ? 3 : tipo === 'electricidad' ? 2 : tipo === 'basura' ? 1.5 : 1;
        const estadoFactor = estado === 'pendiente' ? 1.5 : estado === 'activo' ? 1.2 : 1;
        const recencyFactor = ageDays === null ? 1 : Math.max(0.3, 1 - ageDays / days);
        const weight = severityBase * estadoFactor * recencyFactor;

        return {
          id: row.id,
          lat: coords[0],
          lng: coords[1],
          tipo,
          estado,
          fecha,
          weight
        };
      })
      .filter(Boolean);

    if (puntosValidos.length === 0) {
      return res.json({ clusters: [], meta: { totalReportes: 0, kMax: 0, clustersFound: 0, days } });
    }

    const effectiveK = Math.min(k, puntosValidos.length);
    const clustersRaw = kmeans(puntosValidos, effectiveK);

    const clusters = clustersRaw
      .filter(c => c.points.length > 0)
      .map((cluster, idx) => {
        const count = cluster.points.length;
        const totalWeight = cluster.points.reduce((sum, p) => sum + (p.weight || 1), 0);
        const tiposCount = {};
        const estadosCount = {};
        let sumAge = 0;
        let ageCount = 0;

        for (const p of cluster.points) {
          tiposCount[p.tipo] = (tiposCount[p.tipo] || 0) + 1;
          estadosCount[p.estado] = (estadosCount[p.estado] || 0) + 1;
          if (p.fecha instanceof Date && !Number.isNaN(p.fecha.getTime())) {
            const ageDays = (now - p.fecha.getTime()) / millisPerDay;
            sumAge += ageDays;
            ageCount += 1;
          }
        }

        const topTipo = Object.entries(tiposCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        const avgRecencyDays = ageCount > 0 ? sumAge / ageCount : null;

        return {
          id: idx,
          center: cluster.center,
          count,
          score: totalWeight,
          topTipo,
          estados: estadosCount,
          avgRecencyDays,
          reportIds: cluster.points.map(p => p.id)
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({
      clusters,
      points: puntosValidos,
      meta: {
        totalReportes: puntosValidos.length,
        kMax: effectiveK,
        clustersFound: clusters.length,
        days
      }
    });
  } catch (error) {
    console.error('Error generando heatmap de reportes:', error);
    res.status(500).json({ message: 'Error al generar heatmap de reportes' });
  }
});

// GET calendario combina dias especiales, api de nager.date, fechas importantes de la bd, eventos y los muestra en el calendario
app.get('/api/calendario', async (req, res) => {
    try {
        // Iniciar con el array de días especiales (siempre disponible)
        let calendarioCompleto = [...diasEspeciales];

        // Intentar obtener fechas importantes de la BD
        try {
      if (!supabase) throw new Error('Supabase no configurado');

      const { data: fechasData, error: fechasError } = await supabase
        .from('fechas_importantes')
        .select('*')
        .order('fecha', { ascending: true });

      if (fechasError) throw fechasError;

      const calendarioBD = (fechasData || []).map(item => ({
                id: item.id,
                title: item.titulo,
                date: item.fecha,
                type: 'importante'
            }));
            calendarioCompleto = [...calendarioCompleto, ...calendarioBD];
        } catch (error) {
            console.error('ERROR en consulta BD fechas_importantes:', error.message);
        }

        // Intentar obtener eventos de la BD
        try {
      if (!supabase) throw new Error('Supabase no configurado');

      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true });

      if (eventosError) throw eventosError;

      const calendarioEventos = (eventosData || []).map(item => ({
                id: `evento-${item.id}`,
                title: item.titulo,
                date: item.fecha,
                type: 'evento',
                location: item.ubicacion,
                time: item.hora,
                description: item.descripcion
            }));
            calendarioCompleto = [...calendarioCompleto, ...calendarioEventos];
        } catch (error) {
            console.error('ERROR en consulta BD eventos:', error.message);
        }

        // Intentar obtener días festivos de Nager.date
        try {
            const año = new Date().getFullYear();
            const responseNager = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${año}/MX`, {
              // Aumentamos el timeout para dar más margen a la API externa
              timeout: 15000
            });
            
            const calendarioNager = responseNager.data.map(holiday => ({
                id: `nager-${holiday.date}`,
                title: holiday.localName || holiday.name,
                date: holiday.date,
                type: 'festivo',
                apiSource: 'nager.date'
            }));
            calendarioCompleto = [...calendarioCompleto, ...calendarioNager];
        } catch (error) {
            console.warn('Advertencia: No se pudieron obtener días festivos de Nager.date:', error.message);
        }

        // Eliminar duplicados y ordenar
        const calendarioSinDuplicados = Array.from(
            new Map(calendarioCompleto.map(item => [item.date, item])).values()
        );
        calendarioSinDuplicados.sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(calendarioSinDuplicados);
    } catch (error) {
        console.error('Error al obtener calendario:', error);
        res.status(500).json({ message: 'Error al obtener calendario' });
    }
});

// GET días festivos 
app.get('/api/dias-festivos/:año', (req, res) => {
  const { año } = req.params;
  
  if (!validarAño(año)) {
    return res.status(400).json({ message: 'El año debe ser un número válido entre 2020 y 2100.' });
  }
  
  const diasDelAño = diasEspeciales.filter(dia => dia.date.startsWith(año));
  res.json(diasDelAño);
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


