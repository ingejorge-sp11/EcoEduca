import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Inicializar la aplicación de Express
const app = express();
const port = process.env.PORT || 3001;

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


// --- RUTAS DE LA API ---

// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
  const { nombre, apellido, codigo, password } = req.body;

  if (!nombre || !apellido || !codigo || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
      INSERT INTO users (nombre, apellido, codigo_estudiante, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, codigo_estudiante;
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

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
    const { codigo, password } = req.body;

    if (!codigo || !password) {
        return res.status(400).json({ message: 'El código y la contraseña son obligatorios.' });
    }

    try {
        const userQuery = 'SELECT * FROM users WHERE codigo_estudiante = $1';
        const result = await pool.query(userQuery, [codigo]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Código o contraseña incorrectos.' });
        }

        const payload = { id: user.id, nombre: user.nombre, codigo: user.codigo_estudiante };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', token, user: payload });

    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// DATOS DESDE LA BASE DE DATOS

app.get('/api/novedades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM novedades ORDER BY fecha_publicacion DESC');
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
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.get('/api/eventos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM eventos ORDER BY fecha DESC, hora ASC');
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
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.get('/api/calendario', async (req, res) => {
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
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

