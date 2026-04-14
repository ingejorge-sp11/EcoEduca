//IMPORTACIONES
import React, { useState, useEffect } from 'react';
import { TreePine, Calendar, MapPin, LogIn, UserPlus, X, Menu, Ticket, User, LogOut, Zap, AlertTriangle, Send, Shield, CheckCircle, Clock, Plus, Trash2, LayoutDashboard, Newspaper, Gamepad2, Map } from 'lucide-react';
import JuegosSection from "./components/JuegosSection";
import AdminPanel from "./components/admin/AdminPanel";
import JuegoResiduos from "./components/JuegoResiduos";
import CalendarioView from "./components/calendario/Calendario";
import { EventosView, EventoDetallesView } from "./components/eventos/Eventos";
import NoticiaCarousel from "./components/NoticiaCarousel";
import GamificationDashboard from "./components/gamification/GamificationDashboard";
import '../css/carousel-noticias.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet'
import JuegoReciclajeAnimado from "./components/juegos/JuegoReciclajeAnimado";
import { registrarActividadUsuario, limpiarActividadUsuario } from "./utils/userActivityRecommender";


const API_URL = '/api';

//BARRA DE NAVEGACION (ICONOS)
const Header = ({ user, onLogout, onLoginClick, onRegisterClick, onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { icon: TreePine, text: 'Inicio', view: 'inicio' },
        { icon: Ticket, text: 'Eventos', view: 'eventos' },
        { icon: Calendar, text: 'Calendario', view: 'calendario' },
        { icon: Zap, text: 'Misiones', view: 'misiones' },
        { icon: MapPin, text: 'Mapa', view: 'mapa' },
        { icon: AlertTriangle, text: 'Reportes', view: 'reportes'},
    ];

    return (
        //LOGO Y NOMBRE DE LA PLATAFORMA: REDIRIGE A HOMEPAGE
        <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
            {/* Contenedor principal */}
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('inicio')}>
                    <TreePine className="text-green-600 h-8 w-8" />
                    <h1 className="text-2xl font-bold text-gray-800">EcoEduca</h1>
                </div>

                { /*BARRA DE NAVEGACION (icon, text, view)  */}
                {/* Navegación Desktop */}
                <nav className="hidden md:flex items-center space-x-6">
                    {navLinks.map(link => (
                        <button key={link.text} onClick={() => onNavigate(link.view)}
                            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                            <link.icon className="h-5 w-5" />
                            <span>{link.text}</span>
                        </button>
                    ))}
                    {user && user.rol === 'admin' && (
                        <button onClick={() => onNavigate('admin')} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors font-semibold">
                            <Shield className="h-5 w-5" />
                            <span>Admin</span>
                        </button>
                    )}
                </nav>

                {/* Botones login/usuario */}
                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="flex items-center space-x-2 text-gray-700">
                                <User className="h-5 w-5 text-green-600" />
                                <span>Hola, {user.nombre}</span>
                            </span>
                            <button onClick={onLogout} className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                                <LogOut className="h-5 w-5" />
                                <span>Cerrar Sesión</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={onLoginClick} className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                <LogIn className="h-5 w-5" />
                                <span>Iniciar Sesión</span>
                            </button>
                            <button onClick={onRegisterClick} className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                                <UserPlus className="h-5 w-5" />
                                <span>Registrarse</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Menú mobile */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                </div>
            </div>

            {/* Menú desplegable mobile */}
            {isMenuOpen && (
                <div className="md:hidden bg-white pb-4 px-4">
                    <nav className="flex flex-col space-y-4">
                        {navLinks.map(link => (
                            <button key={link.text} onClick={() => { onNavigate(link.view); setIsMenuOpen(false); }}
                                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors text-lg">
                                <link.icon className="h-5 w-5" />
                                <span>{link.text}</span>
                            </button>
                        ))}
                        {user && user.rol === 'admin' && (
                            <button onClick={() => { onNavigate('admin'); setIsMenuOpen(false); }}
                                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors text-lg font-semibold">
                                <Shield className="h-5 w-5" />
                                <span>Panel Admin</span>
                            </button>
                        )}
                    </nav>
                    {/* Autenticacion mobile */}
                    <div className="flex flex-col space-y-3 mt-4 pt-4 border-t">
                        {user ? (
                            <>
                                <span className="flex items-center justify-center space-x-2 text-gray-700 py-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    <span>Hola, {user.nombre}</span>
                                </span>
                                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="flex items-center justify-center space-x-2 text-red-600 font-semibold py-2">
                                    <LogOut className="h-5 w-5" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                    <LogIn className="h-5 w-5" />
                                    <span>Iniciar Sesión</span>
                                </button>
                                <button onClick={() => { onRegisterClick(); setIsMenuOpen(false); }} className="flex items-center justify-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                                    <UserPlus className="h-5 w-5" />
                                    <span>Registrarse</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

/** COMPONENTE: MODAL
 * -Muestra ventana emergente sin salirse de la pagina
 */
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

/**
 * COMPONENTE: Notification
 Indica exito o error em forms al usuario
 */
const Notification = ({ message, type }) => {
    if (!message) return null;
    const baseClasses = "p-3 rounded-md text-center mb-4 text-sm";
    const typeClasses = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

/**
 * COMPONENTE: LoginForm
    * Formulario para que los estudiantes inicien sesion 
    * -Valida coodigo y contraseña
    * -Envia datos al servidor (/api/login)
 */
const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
    const [formData, setFormData] = useState({ codigo: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ codigo: formData.codigo, password: formData.password }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            if(data.token) localStorage.setItem('token', data.token);
            onLoginSuccess(data);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <Notification message={error} type="error" />}
            <input type="text" placeholder="Código (Ej. 219XXXXXX)" className="w-full px-3 py-2 border rounded-md" required onChange={e => setFormData({...formData, codigo: e.target.value})} />
            <input type="password" placeholder="Contraseña" className="w-full px-3 py-2 border rounded-md" required onChange={e => setFormData({...formData, password: e.target.value})} />
            <button disabled={isLoading} className="w-full bg-green-600 text-white py-2 rounded-md">{isLoading ? 'Cargando...' : 'Iniciar Sesión'}</button>
            <p className="text-sm text-center text-gray-600">¿No tienes cuenta? <button type="button" onClick={onSwitchToRegister} className="text-green-600 hover:underline">Regístrate</button></p>
        </form>
    );
};

/**
 * COMPONENTE: RegisterForm
 * Formulario para que los nuevos estudiantes se registren
 * - Valida nombre, apellido, código y contraseña
 * - Envía datos al servidor (/api/register)
 * - Redirige a login después de registro exitoso
 * - Muestra notificaciones de éxito/error
 */
const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({ nombre: '', apellido: '', codigo_estudiante: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification({ message: '', type: '' });
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error en el registro');
            setNotification({ message: '¡Registro exitoso! Ahora puedes iniciar sesión.', type: 'success' });
            setTimeout(() => onSwitchToLogin(), 2000);
        } catch (err) {
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    {/* FORMULARIO DE REGISTRO */}
    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <Notification message={notification.message} type={notification.type} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                    <input type="text" name="nombre" onChange={handleChange} placeholder="Tu nombre" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                    <input type="text" name="apellido" onChange={handleChange} placeholder="Tu apellido" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Código de Estudiante</label>
                <input type="text" name="codigo" onChange={handleChange} placeholder="Ej. 217XXXXXX" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" name="password" onChange={handleChange} placeholder="Crea una contraseña segura" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"/>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
            <p className="text-sm text-center text-gray-600">
                ¿Ya tienes una cuenta? <button type="button" onClick={onSwitchToLogin} className="font-medium text-green-600 hover:underline">Inicia Sesión</button>
            </p>
        </form>
    );
};

/** BARRA DE SSECCION PRINCIPAL */
const HeroSection = () => (
    <section className="bg-green-50 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">Fomentando una Cultura Ambiental en CUCEI</h2>
            <p className="max-w-3xl mx-auto text-lg text-gray-600">Tu centro de información, participación y acción para un campus más verde y sostenible.</p>
        </div>
    </section>
);

/**COMPONENTES: Mapa view
 * - Muestra mapa interactivo con punto de interes ambiental
 */
const MapaView = () => {
    const [puntos, setPuntos] = useState([]);
    const [reportes, setReportes] = useState([]);
    const [mapKey] = useState(Date.now());
    useEffect(() => {
        fetch(`${API_URL}/mapa`).then(r=>r.json()).then(setPuntos).catch(console.error);
        fetch(`${API_URL}/reportes`).then(r=>r.json()).then(setReportes).catch(console.error);
    }, []);
    // Helper para parsear ubicacion "lat,long"
    const parseUbicacion = (ubicacion) => {
        if (!ubicacion) return null;
        const parts = ubicacion.split(',').map(s => s.trim());
        if (parts.length !== 2) return null;
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (isNaN(lat) || isNaN(lng)) return null;
        return [lat, lng];
    };

    // Icono verde único para todos los puntos del mapa (puntos_mapa)
    const baseMarker = {
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [1, -34],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
        shadowSize: [41, 41]
    };

    const iconPuntoVerde = L.icon({
        ...baseMarker,
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png'
    });

    const getPuntoIcon = () => iconPuntoVerde;

    return (
        <div className="h-[80vh] w-full relative z-0 bg-transparent">
            <MapContainer key={mapKey} center={[20.6555, -103.3255]} zoom={16} style={{height:'100%',width:'100%'}}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                {/* Puntos normales */}
                {puntos.map(p => (
                    <Marker key={p.id} position={[p.latitud, p.longitud]} icon={getPuntoIcon()}>
                        <Popup><b>{p.nombre}</b><br/>{p.descripcion}<br/><span className="badge bg-green-100">{p.categoria}</span></Popup>
                    </Marker>
                ))}
                {/* Reportes como pines rojos */}
                {reportes.map(r => {
                    const pos = parseUbicacion(r.ubicacion);
                    if (!pos) return null;
                    return (
                        <Marker key={"reporte-"+r.id} position={pos} icon={L.icon({iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34], shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png', shadowSize: [41,41]})}>
                            <Popup>
                                <b>{r.titulo}</b><br/>{r.descripcion}<br/><span className="badge bg-red-100">Reporte: {r.tipo}</span>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
/** COMPONENTE: ReportesView
 * -Formulario para que los usuarios reporten incidentes ambientales
 * -Requiere que el usuario inicie sesión
 */
const ReportesView = ({ user, onLoginRequerido }) => {
    const [form, setForm] = useState({ titulo: '', tipo: 'fuga', ubicacion: '', descripcion: '' });
    const [msg, setMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!user) return onLoginRequerido();
        try {
            const res = await fetch(`${API_URL}/reportes`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...form, usuario_id: user.id})
            });
            if(res.ok) {
                setMsg({txt:'Reporte enviado', type:'success'});
                setForm({ titulo: '', tipo: 'fuga', ubicacion: '', descripcion: '' });
                // Marcar misión de reporte como completada en localStorage y sumar puntos
                let progreso = JSON.parse(localStorage.getItem('misiones_diarias')) || {};
                if (!progreso.reporte) {
                  progreso.reporte = true;
                  progreso.puntos_totales = (progreso.puntos_totales || 0) + 30; // 30 puntos por la misión
                  localStorage.setItem('misiones_diarias', JSON.stringify(progreso));
                }
            } else {
                setMsg({txt:'Error', type:'error'});
            }
        } catch {
            setMsg({txt:'Error de red', type:'error'});
        }
    };

    if(!user) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Inicia sesión para reportar</h2>
            <button onClick={onLoginRequerido} className="bg-green-600 text-white px-6 py-2 rounded">Entrar</button>
        </div>
    );

    //FORMULARIO DE REPORTES
    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
                <AlertTriangle className="text-orange-500"/> Reportar Incidente
            </h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 border">
                {msg && <Notification message={msg.txt} type={msg.type}/>}
                <input
                    placeholder="Título"
                    className="w-full border p-2 rounded"
                    required
                    value={form.titulo}
                    onChange={e=>setForm({...form, titulo: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                    <select
                        className="border p-2 rounded"
                        value={form.tipo}
                        onChange={e=>setForm({...form, tipo: e.target.value})}
                    >
                        <option value="fuga">Fuga</option>
                        <option value="basura">Basura</option>
                        <option value="electricidad">Electricidad</option>
                        <option value="otro">Otro</option>
                    </select>
                    <input
                        placeholder="Ubicación"
                        className="border p-2 rounded"
                        required
                        value={form.ubicacion}
                        onChange={e=>setForm({...form, ubicacion: e.target.value})}
                    />
                </div>
                <textarea
                    placeholder="Descripción"
                    rows="3"
                    className="w-full border p-2 rounded"
                    required
                    value={form.descripcion}
                    onChange={e=>setForm({...form, descripcion: e.target.value})}
                />
                <button className="bg-green-600 text-white w-full py-2 rounded font-bold">Enviar</button>
            </form>
        </div>
    );
};

//COMPONENTES APP: CONTROLA SECCION A MOSTRARSE
function App() {
    const [currentView, setCurrentView] = useState('inicio');
    const [selectedEvento, setSelectedEvento] = useState(null);
    const [novedades, setNovedades] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [calendario, setCalendario] = useState([]);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [user, setUser]  = useState(null);
    
    
    /**
     * EFECTO: useEffect Principal
     * Se ejecuta una sola vez al cargar la aplicación
     * - Carga el usuario guardado en localStorage si existe
     * - Obtiene datos iniciales de la API (novedades, eventos, calendario)
     */
    useEffect(() => {
        // Cargar usuario guardado en localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
        // Cargar tema guardado

        // Cargar datos de API
        const fetchData = async () => {
            try {
                const [novedadesRes, eventosRes, calendarioRes] = await Promise.all([
                    fetch(`${API_URL}/novedades`),
                    fetch(`${API_URL}/eventos`),
                    fetch(`${API_URL}/calendario`),
                    fetch(`${API_URL}/mapa`),
                ]);
                setNovedades(await novedadesRes.json());
                setEventos(await eventosRes.json());
                setCalendario(await calendarioRes.json());
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            }
        };
        fetchData();
    }, []);

    // Refrescar novedades automáticamente cuando el admin cambia visibilidad/crea/edita/elimina
    useEffect(() => {
        const refreshNovedades = async () => {
            try {
                const res = await fetch(`${API_URL}/novedades`);
                if (res.ok) setNovedades(await res.json());
            } catch (error) {
                console.warn('No se pudo refrescar novedades:', error);
            }
        };
        const handler = () => refreshNovedades();
        window.addEventListener('ecoedu:novedades-updated', handler);
        return () => window.removeEventListener('ecoedu:novedades-updated', handler);
    }, []);

     // EFECTO: Ajuste de mapa 
    useEffect(() => {
        if (currentView === 'mapa') {
            setTimeout(() => {
                const map = document.querySelector('.leaflet-container');
                if (map) {
                    window.dispatchEvent(new Event('resize'));
                }
            }, 200);
        }
    }, [currentView]);   
    /**
     * FUNCIÓN: handleLoginSuccess
     * Se ejecuta cuando el usuario inicia sesión exitosamente
     * - Guarda los datos del usuario en el estado
     * - Almacena usuario y token en localStorage para persistencia
     * - Cuenta de usuario quede activa
     */
    const handleLoginSuccess = (data) => {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Guardar el token para futuras llamadas autenticadas
        if (data.token) {
            localStorage.setItem("token", data.token);
            console.log(' Token guardado:', data.token);
            console.log('Token en localStorage:', localStorage.getItem('token'));
        }
        closeModal();
    };

    /**
     * FUNCIÓN: handleLogout
     * Limpia la sesión del usuario
     * - Elimina usuario del estado
     * - Borra usuario y token de localStorage
     */
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        limpiarActividadUsuario();
    };

    /**
     * FUNCIÓN: openLoginModal
     * Abre el modal de login
     * - Cierra el modal de registro si está abierto
     */
    const openLoginModal = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };

    /**
     * FUNCIÓN: openRegisterModal
     * Abre el modal de registro
     * - Cierra el modal de login si está abierto
     */
    const openRegisterModal = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    /**
     * FUNCIÓN: closeModal
     * Cierra ambos modales (login y registro)
     */
    const closeModal = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(false);
    };

    // Registrar solo ciertas vistas como actividad del usuario
    const seccionesRastreadas = ['juego-residuos', 'juego-reciclaje-animado', 'mapa', 'calendario', 'eventos', 'reportes'];

    const registrarVista = (view) => {
        if (seccionesRastreadas.includes(view)) {
            registrarActividadUsuario(view);
        }
    };

    const handleNavigate = (view) => {
        setCurrentView(view);
        registrarVista(view);
    };

    // Escuchar navegaciones desde otros componentes (por ejemplo, recomendaciones)
    useEffect(() => {
        const handler = (event) => {
            const view = event.detail;
            if (typeof view === 'string') {
                handleNavigate(view);
            }
        };
        window.addEventListener('ecoedu:navigate', handler);
        return () => window.removeEventListener('ecoedu:navigate', handler);
    }, []);

    /**
     * FUNCIÓN: renderView
     * Renderiza la vista actual según la navegación
     * Muestra la vista de acuerdo a la validacion de permisos (solo si esta logeado)
     */
    const renderView = () => {
        switch (currentView) {

                        case 'juego-reciclaje-animado':
                            return user ? (
                                <JuegoReciclajeAnimado />
                            ) : (
                                <div className="p-8 text-center">
                                    <h2 className="text-2xl font-bold mb-4"> Debes iniciar sesión primero</h2>
                                    <button onClick={openLoginModal} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Iniciar Sesión
                                    </button>
                                </div>
                            );
            case 'evento-detalles':
                return <EventoDetallesView evento={selectedEvento} onBack={() => handleNavigate('eventos')} />;
            case 'eventos':
                return <EventosView data={eventos} onSelectEvento={(evento) => {
                    setSelectedEvento(evento);
                    setCurrentView('evento-detalles');
                }} />;
            case 'calendario':
                return <CalendarioView data={calendario} />;
            case 'misiones':
                return user ? (
                    <GamificationDashboard user={user} />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4"> Debes iniciar sesión primero</h2>
                        <button onClick={openLoginModal} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Iniciar Sesión
                        </button>
                    </div>
                );
            case 'mapa':
                return <MapaView />;
            case 'reportes':
                return <ReportesView user={user} onLoginRequerido={openLoginModal} />;
            case 'juego-residuos':
                return user ? (
                    <JuegoResiduos />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4"> Debes iniciar sesión primero</h2>
                        <button onClick={openLoginModal} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Iniciar Sesión
                        </button>
                    </div>
                );

            case 'admin':
                return user && user.rol === 'admin' ? (
                    <AdminPanel />
                ) : (
                    <div className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Acceso denegado</h2>
                        <p className="text-gray-600">Esta sección es exclusiva para administradores.</p>
                    </div>
                );

            case 'inicio':
            default:
                return (
                    <>
                        <HeroSection />
                        {novedades.length > 0 && (
                            <section className="py-8 md:py-14 bg-white">
                                <div className="max-w-7xl mx-auto px-4">
                                    <NoticiaCarousel noticias={novedades} />
                                </div>
                            </section>
                        )}
                        <JuegosSection onSelectJuego={handleNavigate} />
                    </>
                );
        }
    };
    //SPA: Estructura principal de la app, con header, seccion principal y modales
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <Header
                user={user}
                onLogout={handleLogout}
                onLoginClick={openLoginModal}
                onRegisterClick={openRegisterModal}
                onNavigate={handleNavigate}
            />
            <main>
                {renderView()}
            </main>
            <Modal isOpen={isLoginOpen} onClose={closeModal} title="Iniciar Sesión">
                <LoginForm onSwitchToRegister={openRegisterModal} onLoginSuccess={handleLoginSuccess} />
            </Modal>
            <Modal isOpen={isRegisterOpen} onClose={closeModal} title="Crear Cuenta">
                <RegisterForm onSwitchToLogin={openLoginModal} />
            </Modal>
        </div>
    );
}

export default App;

