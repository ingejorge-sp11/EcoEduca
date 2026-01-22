import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import axios from 'axios';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Configuración de JWT y puntos
const jwtSecret = process.env.JWT_SECRET || 'mi_secreto_temporal';
const PUNTOS_POR_ACIERTO = Number(process.env.PUNTOS_POR_ACIERTO) || 10;

// Inicializar la aplicación de Express
const app = express();
const port = process.env.PORT || 3002;

// Middlewares
app.use(cors()); // Habilita CORS para permitir peticiones desde el frontend
app.use(express.json()); // Permite al servidor entender JSON en las peticiones

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Verificamos la conexión a la base de datos al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar con la base de datos:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error ejecutando la consulta de prueba', err.stack);
    }
    console.log('¡Conexión exitosa a la base de datos PostgreSQL!');
  });
});

// --- MIDDLEWARE DE SEGURIDAD ---
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Acceso denegado.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido.' });
        if (user.rol !== 'admin') {
            return res.status(403).json({ message: 'Requiere permisos de administrador.' });
        }
         req.user = user; ;
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
// Endpoint para obtener el top 10 de usuarios por puntuación
app.get('/api/usuarios/top', async (req, res) => {
  console.log('--- INICIO /api/usuarios/top ---');
  try {
    console.log('Ejecutando consulta SQL para top usuarios...');
    const query = 'SELECT id, nombre, puntuacion FROM usuarios ORDER BY puntuacion DESC LIMIT 10';
    console.log('Consulta:', query);
    const result = await pool.query(query);
    console.log('Resultado de la consulta:', result.rows);
    res.json(result.rows);
    console.log('--- FIN /api/usuarios/top OK ---');
  } catch (error) {
    console.error('Error al obtener el top de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener el ranking de usuarios', error: error });
    console.log('--- FIN /api/usuarios/top ERROR ---');
  }
});
// Endpoint para obtener el top 10 de usuarios por puntuación
app.get('/api/usuarios/top', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, puntuacion FROM usuarios ORDER BY puntuacion DESC LIMIT 10');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener el top de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener el ranking de usuarios' });
  }
});

// Validar año (helper function)
function validarAño(año) {
  const regex = /^\d{4}$/;
  return regex.test(año) && año >= 2020 && año <= 2100;
}

// Validar cantidad (helper function)
function validarCantidad(cantidad) {
  const num = parseInt(cantidad);
  return !isNaN(num) && num > 0 && num <= 50;
}

// Ruta para el registro de usuarios
app.post('/api/v1/auth/register', async (req, res) => {
  const { nombre, apellido, codigo, password } = req.body;

  if (!nombre || !apellido || !codigo || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
      INSERT INTO usuarios (nombre, apellido, codigo_estudiante, password_hash, puntuacion)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING id, nombre, codigo_estudiante, puntuacion;
    `;
    const values = [nombre, apellido, codigo, hashedPassword];

    const result = await pool.query(newUserQuery, values);
    const newUser = result.rows[0];

    res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
  } catch (error) {
    console.error('Error en el registro:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El código de estudiante ya está registrado.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// POST register (legacy)
app.post('/api/register', async (req, res) => {
  const { nombre, apellido, codigo, password } = req.body;

  if (!nombre || !apellido || !codigo || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
      INSERT INTO usuarios (nombre, apellido, codigo_estudiante, password_hash, puntuacion)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING id, nombre, codigo_estudiante, puntuacion;
    `;
    const values = [nombre, apellido, codigo, hashedPassword];

    const result = await pool.query(newUserQuery, values);
    const newUser = result.rows[0];

    res.status(201).json({ message: 'Usuario registrado con éxito', user: newUser });
  } catch (error) {
    console.error('Error en el registro:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El código de estudiante ya está registrado.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
    const { codigo, password } = req.body;

    if (!codigo || !password) {
        return res.status(400).json({ message: 'El código y la contraseña son obligatorios.' });
    }

    try {
        const userQuery = 'SELECT * FROM usuarios WHERE codigo_estudiante = $1';
        const result = await pool.query(userQuery, [codigo]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const payload = { id: user.id, nombre: user.nombre, codigo: user.codigo_estudiante, puntuacion: user.puntuacion };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', token, user: payload });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
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
        const userQuery = 'SELECT * FROM usuarios WHERE codigo_estudiante = $1';
        const result = await pool.query(userQuery, [codigo]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const payload = { id: user.id, nombre: user.nombre, codigo: user.codigo_estudiante, puntuacion: user.puntuacion };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

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

// Middleware de autenticación (Bearer token)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token no proporcionado.' });

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido.' });
    req.user = user;
    next();
  });
}

// Obtener datos del usuario autenticado (incluye puntuacion)
app.get('/api/v1/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, codigo_estudiante, puntuacion FROM usuarios WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// GET usuario autenticado (legacy)
app.get('/api/usuarios/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, codigo_estudiante, puntuacion FROM usuarios WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});
// GET mapa (legacy) - Debe estar ANTES de app.listen()
app.get('/api/mapa', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM puntos_mapa');
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener mapa:', error);
        res.status(500).json({ message: 'Error al obtener mapa' });
    }
});

app.post('/api/reportes', async (req, res) => {
    const { usuario_id, titulo, descripcion, tipo, ubicacion } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO reportes (usuario_id, titulo, descripcion, tipo, ubicacion) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [usuario_id, titulo, descripcion, tipo, ubicacion]
        );
        res.status(201).json({ message: 'Reporte enviado.' });
    } catch (e) { res.status(500).json({ message: 'Error al enviar reporte.' }); }
});

// 5. Gestión de Mapa
app.post('/api/admin/mapa', verifyAdmin, async (req, res) => {
    const { nombre, descripcion, latitud, longitud, categoria } = req.body;
    try {
        await pool.query('INSERT INTO puntos_mapa (nombre, descripcion, latitud, longitud, categoria) VALUES ($1, $2, $3, $4, $5)', [nombre, descripcion, latitud, longitud, categoria]);
        res.status(201).json({ message: 'Punto creado' });
    } catch (e) { res.status(500).json({ message: 'Error creando punto' }); }
});
app.delete('/api/admin/mapa/:id', verifyAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM puntos_mapa WHERE id = $1', [req.params.id]);
        res.json({ message: 'Punto eliminado' });
    } catch (e) { res.status(500).json({ message: 'Error eliminando punto' }); }
});

// Endpoint para guardar el mejor puntaje (solo si es mayor que el anterior)
app.post('/api/v1/users/score', authenticateToken, async (req, res) => {
  const { puntos } = req.body;
  const userId = req.user?.id;

  if (typeof puntos !== 'number' || puntos < 0) {
    return res.status(400).json({ message: 'El campo "puntos" debe ser un número no negativo.' });
  }

  try {
    // Obtener puntuación actual del usuario
    const userRes = await pool.query('SELECT puntuacion FROM usuarios WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const puntuacionActual = userRes.rows[0].puntuacion || 0;

    // Solo actualizar si el nuevo puntaje es mayor
    let nuevaPuntuacion = puntuacionActual;
    if (puntos > puntuacionActual) {
      const result = await pool.query(
        `UPDATE usuarios SET puntuacion = $1 WHERE id = $2 RETURNING id, nombre, codigo_estudiante, puntuacion`,
        [puntos, userId]
      );
      nuevaPuntuacion = result.rows[0].puntuacion;
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

// POST guardar puntaje (legacy)
app.post('/api/usuarios/me/guardar-mejor-puntaje', authenticateToken, async (req, res) => {
  const { puntos } = req.body;
  const userId = req.user?.id;

  if (typeof puntos !== 'number' || puntos < 0) {
    return res.status(400).json({ message: 'El campo "puntos" debe ser un número no negativo.' });
  }

  try {
    // Obtener puntuación actual del usuario
    const userRes = await pool.query('SELECT puntuacion FROM usuarios WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) return res.status(404).json({ message: 'Usuario no encontrado.' });

    const puntuacionActual = userRes.rows[0].puntuacion || 0;

    // Solo actualizar si el nuevo puntaje es mayor
    let nuevaPuntuacion = puntuacionActual;
    if (puntos > puntuacionActual) {
      const result = await pool.query(
        `UPDATE usuarios SET puntuacion = $1 WHERE id = $2 RETURNING id, nombre, codigo_estudiante, puntuacion`,
        [puntos, userId]
      );
      nuevaPuntuacion = result.rows[0].puntuacion;
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

// DATOS DESDE LA BASE DE DATOS

app.get('/api/v1/content/news', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM novedades ORDER BY fecha_publicacion DESC LIMIT 20');
    //Transformamos los nombres de las columnas para que coincidan con lo que espera el frontend
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

// ========== RUTAS DE PRODUCTOS ==========

// GET todos los productos
app.get('/api/v1/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY RANDOM() LIMIT 5');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET productos por categoría
app.get('/api/v1/products/category/:categoria', async (req, res) => {
  try {
    const { categoria } = req.params;
    
    // Validar que la categoría no esté vacía
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ message: 'La categoría no puede estar vacía.' });
    }

    const result = await pool.query(
      'SELECT * FROM productos WHERE LOWER(categoria) = LOWER($1) ORDER BY RANDOM() LIMIT 20',
      [categoria]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay productos en esta categoría.' });
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// GET productos aleatorios
app.get('/api/v1/products/random/:cantidad', async (req, res) => {
  try {
    const { cantidad } = req.params;
    
    if (!validarCantidad(cantidad)) {
      return res.status(400).json({ message: 'La cantidad debe ser un número entre 1 y 50.' });
    }

    const result = await pool.query(
      'SELECT * FROM productos ORDER BY RANDOM() LIMIT $1',
      [parseInt(cantidad)]
    );
    
    res.json(result.rows);
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

// Endpoint que obtiene días festivos de México desde Nager.date
app.get('/api/v1/calendar/holidays/mexico/:año', async (req, res) => {
  const { año } = req.params;
  
  if (!validarAño(año)) {
    return res.status(400).json({ message: 'El año debe ser un número válido entre 2020 y 2100.' });
  }
  
  try {
    // Llamar a la API de Nager.date para obtener días festivos de México (country code: MX)
    const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${año}/MX`, {
      timeout: 5000
    });
    
    // Transformar los datos de la API
    const diasFestivos = response.data.map(holiday => ({
      date: holiday.date,
      title: holiday.localName || holiday.name,
      type: 'nacional',
      international: holiday.isPublicHoliday,
      apiSource: 'nager.date'
    }));
    
    res.json(diasFestivos);
  } catch (error) {
    console.error('Error al obtener días festivos de Nager.date:', error.message);
    res.status(500).json({ message: 'Error al obtener días festivos de México', error: error.message });
  }
});

// Endpoint que combina días festivos de Nager.date con días especiales ambientales
app.get('/api/v1/calendar/holidays/complete/:año', async (req, res) => {
  const { año } = req.params;
  
  if (!validarAño(año)) {
    return res.status(400).json({ message: 'El año debe ser un número válido entre 2020 y 2100.' });
  }
  
  try {
    // Obtener días festivos nacionales desde Nager.date
    const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${año}/MX`, {
      timeout: 5000
    });
    
    const diasFestivosNacionales = response.data.map(holiday => ({
      date: holiday.date,
      title: holiday.localName || holiday.name,
      type: 'nacional',
      international: holiday.isPublicHoliday,
      apiSource: 'nager.date'
    }));
    
    // Filtrar días especiales ambientales del año solicitado
    const diasAmbientalesDelAño = diasEspeciales.filter(dia => dia.date.startsWith(año));
    
    // Combinar ambos arreglos
    const diasCombinados = [...diasFestivosNacionales, ...diasAmbientalesDelAño];
    
    // Ordenar por fecha
    diasCombinados.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json(diasCombinados);
  } catch (error) {
    console.error('Error al obtener días festivos completos:', error.message);
    res.status(500).json({ message: 'Error al obtener días festivos', error: error.message });
  }
});

// Endpoint que obtiene solo días ambientales especiales (legacy)
app.get('/api/v1/calendar/holidays/environmental/:año', (req, res) => {
  const { año } = req.params;
  
  if (!validarAño(año)) {
    return res.status(400).json({ message: 'El año debe ser un número válido entre 2020 y 2100.' });
  }
  
  const diasDelAño = diasEspeciales.filter(dia => dia.date.startsWith(año));
  res.json(diasDelAño);
});

// ===== RUTAS LEGACY (COMPATIBILIDAD CON FRONTEND ANTIGUO) =====

// GET novedades (legacy)
app.get('/api/novedades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM novedades ORDER BY fecha_publicacion DESC LIMIT 20');
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

// GET eventos (legacy)
app.get('/api/eventos', async (req, res) => {
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

// GET calendario (legacy) - Combina BD + Nager.date
app.get('/api/calendario', async (req, res) => {
    try {
        // Iniciar con el array de días especiales (siempre disponible)
        let calendarioCompleto = [...diasEspeciales];

        // Intentar obtener fechas importantes de la BD
        try {
            const resultBD = await pool.query('SELECT * FROM fechas_importantes ORDER BY fecha ASC');
            const calendarioBD = resultBD.rows.map(item => ({
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
            const resultEventos = await pool.query('SELECT * FROM eventos ORDER BY fecha ASC');
            const calendarioEventos = resultEventos.rows.map(item => ({
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
                timeout: 5000
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

// GET días festivos (legacy)
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

