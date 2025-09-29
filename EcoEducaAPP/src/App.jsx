import React, { useState, useEffect } from 'react';
import { TreePine, Calendar, MapPin, LogIn, UserPlus, X, Menu, Ticket, User, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

// --- COMPONENTES ---

const Header = ({ user, onLogout, onLoginClick, onRegisterClick, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { icon: TreePine, text: 'Inicio', view: 'inicio' },
    { icon: Ticket, text: 'Eventos', view: 'eventos' },
    { icon: Calendar, text: 'Calendario', view: 'calendario' },
    { icon: MapPin, text: 'Mapa', view: 'mapa' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('inicio')}>
          <TreePine className="text-green-600 h-8 w-8" />
          <h1 className="text-2xl font-bold text-gray-800">EcoEduca</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <button key={link.text} onClick={() => onNavigate(link.view)} className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
              <link.icon className="h-5 w-5" />
              <span>{link.text}</span>
            </button>
          ))}
        </nav>

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

        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white pb-4 px-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <button key={link.text} onClick={() => { onNavigate(link.view); setIsMenuOpen(false); }} className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors text-lg">
                <link.icon className="h-5 w-5" />
                <span>{link.text}</span>
              </button>
            ))}
          </nav>
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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md animate-fade-in-up">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Notification = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = "p-3 rounded-md text-center mb-4 text-sm";
  const typeClasses = type === 'success' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

const LoginForm = ({ onSwitchToRegister, onLoginSuccess }) => {
    const [codigo, setCodigo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }
            onLoginSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <Notification message={error} type="error" />}
            <div>
                <label className="block text-sm font-medium text-gray-700">Código de Estudiante</label>
                <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Ej. 217XXXXXX" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"/>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-300">
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
            <p className="text-sm text-center text-gray-600">
                ¿No tienes cuenta? <button type="button" onClick={onSwitchToRegister} className="font-medium text-green-600 hover:underline">Regístrate</button>
            </p>
        </form>
    );
};

const RegisterForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({ nombre: '', apellido: '', codigo: '', password: '' });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }
            setNotification({ message: '¡Registro exitoso! Ahora puedes iniciar sesión.', type: 'success' });
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setNotification({ message: err.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

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

const HeroSection = () => (
  <section className="bg-green-50 py-12 md:py-20">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 mb-4">Fomentando una Cultura Ambiental en CUCEI</h2>
      <p className="max-w-3xl mx-auto text-lg text-gray-600">
        Tu centro de información, participación y acción para un campus más verde y sostenible.
      </p>
    </div>
  </section>
);

const NovedadesSection = ({ data }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-4">
      <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Novedades y Noticias</h3>
      <div className="grid md:grid-cols-2 gap-8">
        {data.map(item => (
          <div key={item.id} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h4 className="font-bold text-xl text-green-700 mb-2">{item.title}</h4>
            <p className="text-gray-600">{item.summary}</p>
            {item.date && <p className="text-sm text-gray-400 mt-4">{item.date}</p>}
          </div>
        ))}
      </div>
    </div>
  </section>
);

const EventosView = ({ data }) => (
  <div className="container mx-auto px-4 py-12">
    <h2 className="text-3xl font-bold text-center mb-8">Próximos Eventos</h2>
    <div className="space-y-6">
      {data.map(evento => (
        <div key={evento.id} className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-green-700">{evento.title}</h3>
          <div className="flex flex-wrap items-center text-gray-600 my-2 space-x-4">
            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1"/> {evento.location}</span>
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1"/> {evento.date} a las {evento.time}</span>
          </div>
          <p className="text-gray-700 mt-2">{evento.description}</p>
        </div>
      ))}
    </div>
  </div>
);

const CalendarioView = ({ data }) => (
    <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Calendario Ambiental</h2>
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <ul className="space-y-4">
                {data.map(item => (
                    <li key={item.id} className="flex items-start space-x-4 p-3 bg-green-50 rounded-md">
                        <Calendar className="h-6 w-6 text-green-600 mt-1"/>
                        <div>
                            <p className="font-semibold text-gray-800">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const MapaView = () => (
    <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Mapa Interactivo del Campus</h2>
        <p className="text-gray-600 mb-8">Esta sección contendrá un mapa de CUCEI con puntos de interés sostenibles.</p>
        <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">[Aquí se integrará el mapa interactivo]</p>
        </div>
    </div>
);

function App() {
  const [currentView, setCurrentView] = useState('inicio');
  const [novedades, setNovedades] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [calendario, setCalendario] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [novedadesRes, eventosRes, calendarioRes] = await Promise.all([
          fetch(`${API_URL}/novedades`), fetch(`${API_URL}/eventos`), fetch(`${API_URL}/calendario`)
        ]);
        setNovedades(await novedadesRes.json());
        setEventos(await eventosRes.json());
        setCalendario(await calendarioRes.json());
      } catch (error) { console.error("Error al cargar los datos:", error); }
    };
    fetchData();
  }, []);

  const handleLoginSuccess = (data) => {
    setUser(data.user);
    closeModal();
  };

  const handleLogout = () => {
    setUser(null);
  };

  const openLoginModal = () => { setIsRegisterOpen(false); setIsLoginOpen(true); };
  const openRegisterModal = () => { setIsLoginOpen(false); setIsRegisterOpen(true); };
  const closeModal = () => { setIsLoginOpen(false); setIsRegisterOpen(false); };

  const renderView = () => {
    switch (currentView) {
      case 'eventos': return <EventosView data={eventos} />;
      case 'calendario': return <CalendarioView data={calendario} />;
      case 'mapa': return <MapaView />;
      case 'inicio':
      default: return (<><HeroSection /><NovedadesSection data={novedades} /></>);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={openLoginModal}
        onRegisterClick={openRegisterModal}
        onNavigate={setCurrentView}
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

