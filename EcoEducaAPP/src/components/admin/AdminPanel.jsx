import React, { useEffect, useState } from 'react';
import { Shield, LayoutDashboard, AlertTriangle, Calendar, Newspaper, MapPin, CheckCircle, XCircle, Pencil, Save, X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Usamos ruta relativa para que pase por el proxy /api de Vite
const API_URL = '/api';

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportes, setReportes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [eventosSubTab, setEventosSubTab] = useState('listar'); // listar | crear
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [editForm, setEditForm] = useState({ titulo:'', descripcion:'', fecha:'', hora:'', ubicacion:'' });
  const [novedades, setNovedades] = useState([]);
  const [editNews, setEditNews] = useState(null);
  const [editNewsForm, setEditNewsForm] = useState({ titulo:'', resumen:'', fecha_publicacion:'' });
  const [novedadesSubTab, setNovedadesSubTab] = useState('listar');
  const [showCreateNewsForm, setShowCreateNewsForm] = useState(false);
  const [puntos, setPuntos] = useState([]);
  const [editPoint, setEditPoint] = useState(null);
  const [editPointForm, setEditPointForm] = useState({ nombre:'', descripcion:'', latitud:'', longitud:'', categoria:'' });
  const [mapaSubTab, setMapaSubTab] = useState('listar');
  const [showCreatePointForm, setShowCreatePointForm] = useState(false);
  const [newsForm, setNewsForm] = useState({ titulo: '', resumen: '', fecha_publicacion: '' });
  const [eventForm, setEventForm] = useState({ titulo: '', descripcion: '', fecha: '', hora: '', ubicacion: '' });
  const [mapForm, setMapForm] = useState({ nombre: '', descripcion: '', latitud: '', longitud: '', categoria: '' });
  const [notif, setNotif] = useState(null);
  const [heatmapClusters, setHeatmapClusters] = useState([]);
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [heatmapMeta, setHeatmapMeta] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [heatmapError, setHeatmapError] = useState(null);
  const [heatmapConfig, setHeatmapConfig] = useState({ days: 30, k: 4 });

  const getClusterColor = (scoreRaw) => {
    const score = typeof scoreRaw === 'number' ? scoreRaw : 0;

    if (score >= 40) return '#b91c1c';  // muy alta urgencia
    if (score >= 25) return '#f97316';  // alta urgencia
    if (score >= 10) return '#eab308';  // urgencia media
    return '#22c55e';                   // urgencia baja
  };

  // Capa de mapa de calor basada en leaflet.heat
  const HeatmapLayer = ({ points }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !points || points.length === 0) return;

      const heatData = points
        .map(p => {
          const lat =
            typeof p.lat === 'number' ? p.lat :
            typeof p.latitude === 'number' ? p.latitude :
            typeof p.latitud === 'number' ? p.latitud :
            null;
          const lng =
            typeof p.lng === 'number' ? p.lng :
            typeof p.lon === 'number' ? p.lon :
            typeof p.longitude === 'number' ? p.longitude :
            typeof p.longitud === 'number' ? p.longitud :
            null;

          if (lat == null || lng == null) return null;

          const weight =
            typeof p.weight === 'number' ? p.weight :
            typeof p.intensity === 'number' ? p.intensity :
            1;

          return [lat, lng, weight];
        })
        .filter(Boolean);

      if (heatData.length === 0) return;

      let layer;

      const createLayer = () => {
        if (!L.heatLayer) {
          console.error('leaflet.heat no está disponible: L.heatLayer es undefined');
          return;
        }

        console.log('Creando capa de calor con puntos:', heatData.length);

       //Adapta el tamaño del mapa
        const size = map.getSize();
        if (!size || size.x === 0 || size.y === 0) {
          return;
        }

        map.invalidateSize();

        try {
          layer = L.heatLayer(heatData, {
            radius: 45,
            blur: 30,
            maxZoom: 18,
            maxOpacity: 0.9,
            minOpacity: 0.4,
            gradient: {
              0.0: '#22c55e', // verde
              0.4: '#eab308', // amarillo
              0.7: '#f97316', // naranja
              1.0: '#b91c1c', // rojo intenso
            },
          }).addTo(map);
        } catch (e) {
          console.error('Error creando capa de calor', e);
        }
      };

      if (map._loaded) {
        createLayer();
      } else {
        map.once('load', createLayer);
      }

      return () => {
        if (layer) {
          map.removeLayer(layer);
        }
        map.off('load', createLayer);
      };
    }, [map, points]);

    return null;
  };

 

  // Browser-style tab component
  const BrowserTabs = ({ tabs, activeKey, onChange }) => (
    <div className="flex items-end gap-2 mb-0">
      {tabs.map((tab, idx) => {
        const isActive = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative -mb-px px-4 py-2 rounded-t-xl border transition ${isActive ? 'bg-white border-gray-300 shadow-sm z-10' : 'bg-indigo-50/70 border-gray-300 shadow-sm opacity-90 hover:opacity-100'} ${idx>0 ? '-ml-2' : ''}`}
          >
            {tab.icon && <tab.icon className={`h-4 w-4 inline ${isActive ? 'text-blue-600' : 'text-blue-500'}`} />}
            <span className="ml-2">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  useEffect(() => {
    // Ocultar todo si el usuario no es admin desde el cliente
    const localUser = (() => {
      try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    })();
    if (localUser && localUser.rol !== 'admin') {
      setError('Esta sección es exclusiva para administradores.');
      setLoading(false);
      setIsAdmin(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { setError('No hay token. Inicia sesión.'); setLoading(false); return; }
    const headers = { 'Authorization': `Bearer ${token}` };
    (async () => {
      try {
        const s = await fetch(`${API_URL}/admin/stats`, { headers });
        if (s.status === 200) {
          setIsAdmin(true);
          setStats(await s.json());
          // Cargar colecciones
          try { const r = await fetch(`${API_URL}/admin/reportes`, { headers }); if (r.ok) setReportes(await r.json()); } catch {}
          try { const e = await fetch(`${API_URL}/eventos`); if (e.ok) setEventos(await e.json()); } catch {}
          try {
            const nAdmin = await fetch(`${API_URL}/admin/novedades`, { headers });
            if (nAdmin.ok) {
              setNovedades(await nAdmin.json());
            } else {
              const nPub = await fetch(`${API_URL}/novedades`);
              if (nPub.ok) setNovedades(await nPub.json());
            }
          } catch {
            try {
              const nPub = await fetch(`${API_URL}/novedades`);
              if (nPub.ok) setNovedades(await nPub.json());
            } catch {}
          }
          try { const m = await fetch(`${API_URL}/mapa`); if (m.ok) setPuntos(await m.json()); } catch {}
        } else if (s.status === 403) {
          setError('Acceso denegado: tu token no es admin.');
          setIsAdmin(false);
        } else if (s.status === 404) {
          setError('Ruta admin no encontrada en el servidor (404).');
        }
        // Verificar /admin/me si existe
        try {
          const me = await fetch(`${API_URL}/admin/me`, { headers });
          if (me.ok) { const meJson = await me.json(); setIsAdmin(!!meJson.admin); }
        } catch {}
      } catch (e) {
        setError('Error de conexión con el servidor.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-10">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-100 text-red-700 rounded flex items-center gap-2"><XCircle className="h-5 w-5"/>{error}</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-yellow-100 text-yellow-700 rounded flex items-center gap-2"><AlertTriangle className="h-5 w-5"/>Validando permisos de administrador…</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="relative overflow-hidden rounded-xl mb-6 bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500">
        <div className="absolute right-0 top-0 opacity-20">
          <Shield className="w-32 h-32 text-white" />
        </div>
        <div className="p-6 md:p-8 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-7 w-7" />
            <h2 className="text-2xl md:text-3xl font-bold">Panel de Administración</h2>
          </div>
          <p className="mt-2 text-sm md:text-base text-white/90">Control de eventos, reportes y novedades.</p>
          <div className="mt-4 flex gap-3">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm"><CheckCircle className="h-4 w-4"/> Rol: Admin</span>
            {stats && (
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-sm"><LayoutDashboard className="h-4 w-4"/> {stats.usuariosTotales} usuarios</span>
            )}
          </div>
        </div>
      </div>

      {/* Navegación de pestañas con iconos (sección principal) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key:'overview', label:'Resumen', icon: LayoutDashboard },
          { key:'reportes', label:'Reportes', icon: AlertTriangle },
          { key:'eventos', label:'Eventos', icon: Calendar },
          { key:'novedades', label:'Novedades', icon: Newspaper },
          { key:'mapa', label:'Mapa', icon: MapPin },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition ${activeTab===tab.key? 'bg-green-600 text-white border-green-600':'bg-white text-gray-700 border-gray-200 hover:border-green-300'}`}>
            <tab.icon className="h-4 w-4"/>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {notif && (
        <div className={`flex items-center gap-2 p-3 mb-4 rounded ${notif.type==='success'?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-700 border border-red-200'}`}>
          {notif.type==='success' ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
          <span>{notif.msg}</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Reportes pendientes</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-800">{stats?.reportesPendientes ?? '-'}</div>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Usuarios</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-800">{stats?.usuariosTotales ?? '-'}</div>
            </div>
            <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="text-xs uppercase tracking-wide text-gray-500">Eventos activos</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-800">{stats?.eventosActivos ?? '-'}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reportes' && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500"/> Moderación de Reportes</h3>
          <table className="w-full text-sm bg-white rounded-xl overflow-hidden border border-gray-200">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2">ID</th><th>Título</th><th>Autor</th><th>Estado</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{r.id}</td>
                  <td>{r.titulo}</td>
                  <td>{r.autor || r.usuario_id}</td>
                  <td>{r.estado}</td>
                  <td>
                    <select defaultValue={r.estado || 'pendiente'} className="border px-2 py-1 mr-2 rounded" id={`estado-${r.id}`}>
                      <option value="pendiente">pendiente</option>
                      <option value="aprobado">aprobado</option>
                      <option value="activo">activo</option>
                    </select>
                    <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={async () => {
                      const token = localStorage.getItem('token');
                      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                      const estado = document.getElementById(`estado-${r.id}`).value;
                      const res = await fetch(`${API_URL}/admin/reportes/${r.id}`, { method:'PUT', headers, body: JSON.stringify({ estado }) });
                      if (res.ok) {
                        setNotif({ type:'success', msg:'Estado actualizado' });
                        // refrescar reportes
                        const rr = await fetch(`${API_URL}/admin/reportes`, { headers:{ 'Authorization': `Bearer ${token}` } });
                        if (rr.ok) setReportes(await rr.json());
                      } else setNotif({ type:'error', msg:'Error actualizando' });
                    }}>Guardar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'eventos' && (
        <div className="space-y-4">
          <BrowserTabs
            tabs={[
              { key:'listar', label:'Ver Eventos', icon: Calendar },
              { key:'crear', label:'Crear Evento', icon: Calendar },
            ]}
            activeKey={eventosSubTab}
            onChange={setEventosSubTab}
          />
          <div className="rounded-b-xl rounded-tr-xl border border-gray-300 bg-white shadow-sm p-4">
            {/* Crear evento: */}
            {eventosSubTab === 'crear' && (
              <div className="space-y-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
                  onClick={() => setShowCreateForm(v => !v)}
                >
                  {showCreateForm ? <X className="h-4 w-4"/> : <Calendar className="h-4 w-4"/>}
                  {showCreateForm ? 'Ocultar Formulario' : 'Nuevo Evento'}
                </button>
                {showCreateForm && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['titulo','descripcion','fecha','hora','ubicacion'].map(k => (
                        <input key={k} className="border p-2 rounded" placeholder={k} value={eventForm[k]} onChange={(e)=>setEventForm({ ...eventForm, [k]: e.target.value })} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                        const token = localStorage.getItem('token');
                        const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                        const res = await fetch(`${API_URL}/admin/eventos`, { method:'POST', headers, body: JSON.stringify(eventForm) });
                        if (res.ok) {
                          setNotif({ type:'success', msg:'Evento creado' });
                          const e = await fetch(`${API_URL}/eventos`);
                          if (e.ok) setEventos(await e.json());
                          setEventForm({ titulo:'', descripcion:'', fecha:'', hora:'', ubicacion:'' });
                          setShowCreateForm(false);
                          setEventosSubTab('listar');
                        }
                        else setNotif({ type:'error', msg:'Error creando evento' });
                      }}>
                        <Save className="h-4 w-4"/> Guardar
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded" onClick={()=>{ setShowCreateForm(false); }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Listar eventos con opción de editar */}
            {eventosSubTab === 'listar' && (
              <div className="space-y-3">
                <h3 className="font-semibold mt-2">Eventos</h3>
                <ul className="space-y-2">
                  {eventos.map(ev => {
                    const title = ev.title || ev.titulo || '';
                    const location = ev.location || ev.ubicacion || '';
                    const date = ev.date || ev.fecha || '';
                    const time = ev.time || ev.hora || '';
                    const isEditing = editEvent && editEvent.id === ev.id;
                    return (
                      <li key={ev.id} className="p-3 bg-white rounded shadow flex flex-col gap-2">
                        {!isEditing ? (
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold">{title}</div>
                              <div className="text-xs text-gray-600">{location} • {date} {time}</div>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-blue-600 text-white rounded inline-flex items-center gap-2" onClick={() => {
                                setEditEvent(ev);
                                setEditForm({ titulo: ev.titulo || ev.title || '', descripcion: ev.descripcion || '', fecha: ev.fecha || ev.date || '', hora: ev.hora || ev.time || '', ubicacion: ev.ubicacion || ev.location || '' });
                              }}>
                                <Pencil className="h-4 w-4"/> Editar
                              </button>
                              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async ()=>{
                                const token = localStorage.getItem('token');
                                const headers = { 'Authorization': `Bearer ${token}` };
                                const res = await fetch(`${API_URL}/admin/eventos/${ev.id}`, { method:'DELETE', headers });
                                if (res.ok) { setNotif({ type:'success', msg:'Evento eliminado' }); const e = await fetch(`${API_URL}/eventos`); if (e.ok) setEventos(await e.json()); }
                                else setNotif({ type:'error', msg:'Error eliminando evento' });
                              }}>Eliminar</button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {['titulo','descripcion','fecha','hora','ubicacion'].map(k => (
                                <input key={k} className="border p-2 rounded" placeholder={k} value={editForm[k]} onChange={(e)=>setEditForm({ ...editForm, [k]: e.target.value })} />
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                                const token = localStorage.getItem('token');
                                const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                                const res = await fetch(`${API_URL}/admin/eventos/${ev.id}`, { method:'PUT', headers, body: JSON.stringify(editForm) });
                                if (res.ok) {
                                  setNotif({ type:'success', msg:'Evento actualizado' });
                                  const e = await fetch(`${API_URL}/eventos`);
                                  if (e.ok) setEventos(await e.json());
                                  setEditEvent(null);
                                } else {
                                  setNotif({ type:'error', msg:'Error actualizando evento' });
                                }
                              }}>
                                <Save className="h-4 w-4"/> Guardar
                              </button>
                              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded inline-flex items-center gap-2" onClick={()=>{ setEditEvent(null); }}>
                                <X className="h-4 w-4"/> Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'novedades' && (
        <div className="space-y-4">
          <BrowserTabs
            tabs={[
              { key:'listar', label:'Ver Novedades', icon: Newspaper },
              { key:'crear', label:'Crear Noticia', icon: Newspaper },
            ]}
            activeKey={novedadesSubTab}
            onChange={setNovedadesSubTab}
          />
          <div className="rounded-b-xl rounded-tr-xl border border-gray-300 bg-white shadow-sm p-4">

          {/* Crear noticia: */}
          {novedadesSubTab === 'crear' && (
            <div className="space-y-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => setShowCreateNewsForm(v => !v)}
              >
                {showCreateNewsForm ? <X className="h-4 w-4"/> : <Newspaper className="h-4 w-4"/>}
                {showCreateNewsForm ? 'Ocultar Formulario' : 'Nueva Noticia'}
              </button>
              {showCreateNewsForm && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><Newspaper className="h-5 w-5 text-indigo-600"/> Datos de la Noticia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {['titulo','resumen','fecha_publicacion'].map(k => (
                      <input key={k} className="border p-2 rounded" placeholder={k} value={newsForm[k]} onChange={(e)=>setNewsForm({ ...newsForm, [k]: e.target.value })} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                      const token = localStorage.getItem('token');
                      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                      const res = await fetch(`${API_URL}/admin/novedades`, { method:'POST', headers, body: JSON.stringify(newsForm) });
                      if (res.ok) {
                        setNotif({ type:'success', msg:'Noticia creada' });
                        const n = await fetch(`${API_URL}/novedades`);
                        if (n.ok) setNovedades(await n.json());
                        // Notificar a la app principal para refrescar el carrusel
                        window.dispatchEvent(new CustomEvent('ecoedu:novedades-updated'));
                        setNewsForm({ titulo:'', resumen:'', fecha_publicacion:'' });
                        setShowCreateNewsForm(false);
                        setNovedadesSubTab('listar');
                      } else setNotif({ type:'error', msg:'Error creando noticia' });
                    }}>
                      <Save className="h-4 w-4"/> Guardar
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded" onClick={()=>{ setShowCreateNewsForm(false); }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listar novedades con opción de editar */}
          {novedadesSubTab === 'listar' && (
            <div className="space-y-3">
              <h3 className="font-semibold mt-2">Novedades</h3>
              <ul className="space-y-2">
                {novedades.length === 0 && (
                  <li className="p-2 text-gray-500 text-sm">No hay novedades para mostrar.</li>
                )}
                {novedades.map(nv => (
                  <li key={nv.id} className="p-2 bg-white rounded shadow">
                    {(!(editNews && editNews.id === nv.id)) ? (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{nv.title || nv.titulo}</div>
                          <div className="text-xs text-gray-600">{nv.summary || nv.resumen} • {nv.date || nv.fecha_publicacion}</div>
                          <div className="mt-1">
                            <label className="inline-flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                defaultChecked={nv.visible !== false}
                                onChange={async (e) => {
                                  const token = localStorage.getItem('token');
                                  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
                                  const res = await fetch(`${API_URL}/admin/novedades/${nv.id}/visibilidad`, {
                                    method:'PUT', headers, body: JSON.stringify({ visible: e.target.checked })
                                  });
                                  if (res.ok) {
                                    setNotif({ type:'success', msg: e.target.checked ? 'Mostrando en carrusel' : 'Ocultado del carrusel' });
                                    const nAdmin = await fetch(`${API_URL}/admin/novedades`, { headers });
                                    if (nAdmin.ok) {
                                      setNovedades(await nAdmin.json());
                                    } else {
                                      const nPub = await fetch(`${API_URL}/novedades`);
                                      if (nPub.ok) setNovedades(await nPub.json());
                                    }
                                    // Notificar a la app principal para refrescar el carrusel
                                    window.dispatchEvent(new CustomEvent('ecoedu:novedades-updated'));
                                  } else {
                                    try {
                                      const errJson = await res.json();
                                      setNotif({ type:'error', msg: errJson.message || 'No se pudo actualizar visibilidad' });
                                    } catch {
                                      setNotif({ type:'error', msg:'No se pudo actualizar visibilidad' });
                                    }
                                  }
                                }}
                              />
                              <span>Mostrar en carrusel</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded inline-flex items-center gap-2" onClick={() => {
                            setEditNews(nv);
                            setEditNewsForm({ titulo: nv.titulo || nv.title || '', resumen: nv.resumen || nv.summary || '', fecha_publicacion: nv.fecha_publicacion || nv.date || '' });
                          }}>
                            <Pencil className="h-4 w-4"/> Editar
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async ()=>{
                            const token = localStorage.getItem('token');
                            const headers = { 'Authorization': `Bearer ${token}` };
                            const res = await fetch(`${API_URL}/admin/novedades/${nv.id}`, { method:'DELETE', headers });
                            if (res.ok) {
                              setNotif({ type:'success', msg:'Noticia eliminada' });
                              const nAdmin = await fetch(`${API_URL}/admin/novedades`, { headers });
                              if (nAdmin.ok) {
                                setNovedades(await nAdmin.json());
                              } else {
                                const nPub = await fetch(`${API_URL}/novedades`);
                                if (nPub.ok) setNovedades(await nPub.json());
                              }
                              window.dispatchEvent(new CustomEvent('ecoedu:novedades-updated'));
                            }
                            else setNotif({ type:'error', msg:'Error eliminando noticia' });
                          }}>Eliminar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {['titulo','resumen','fecha_publicacion'].map(k => (
                            <input key={k} className="border p-2 rounded" placeholder={k} value={editNewsForm[k]} onChange={(e)=>setEditNewsForm({ ...editNewsForm, [k]: e.target.value })} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                            const token = localStorage.getItem('token');
                            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                            const res = await fetch(`${API_URL}/admin/novedades/${nv.id}`, { method:'PUT', headers, body: JSON.stringify(editNewsForm) });
                            if (res.ok) {
                              setNotif({ type:'success', msg:'Noticia actualizada' });
                              const nAdmin = await fetch(`${API_URL}/admin/novedades`, { headers });
                              if (nAdmin.ok) {
                                setNovedades(await nAdmin.json());
                              } else {
                                const nPub = await fetch(`${API_URL}/novedades`);
                                if (nPub.ok) setNovedades(await nPub.json());
                              }
                              window.dispatchEvent(new CustomEvent('ecoedu:novedades-updated'));
                              setEditNews(null);
                            } else setNotif({ type:'error', msg:'Error actualizando noticia' });
                          }}>
                            <Save className="h-4 w-4"/> Guardar
                          </button>
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded inline-flex items-center gap-2" onClick={()=>{ setEditNews(null); }}>
                            <X className="h-4 w-4"/> Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          </div>
        </div>
      )}

      {activeTab === 'mapa' && (
        <div className="space-y-4">
          <BrowserTabs
            tabs={[
              { key:'listar', label:'Ver Puntos', icon: MapPin },
              { key:'crear', label:'Crear Punto', icon: MapPin },
              { key:'heatmap', label:'Zonas prioritarias', icon: MapPin },
            ]}
            activeKey={mapaSubTab}
            onChange={setMapaSubTab}
          />
          <div className="rounded-b-xl rounded-tr-xl border border-gray-300 bg-white shadow-sm p-4">

          {/* Crear punto: */}
          {mapaSubTab === 'crear' && (
            <div className="space-y-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => setShowCreatePointForm(v => !v)}
              >
                {showCreatePointForm ? <X className="h-4 w-4"/> : <MapPin className="h-4 w-4"/>}
                {showCreatePointForm ? 'Ocultar Formulario' : 'Nuevo Punto'}
              </button>
              {showCreatePointForm && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><MapPin className="h-5 w-5 text-green-700"/> Datos del Punto</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {['nombre','descripcion','latitud','longitud','categoria'].map(k => (
                      <input key={k} className="border p-2 rounded" placeholder={k} value={mapForm[k]} onChange={(e)=>setMapForm({ ...mapForm, [k]: e.target.value })} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                      const token = localStorage.getItem('token');
                      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                      const res = await fetch(`${API_URL}/admin/mapa`, { method:'POST', headers, body: JSON.stringify(mapForm) });
                      if (res.ok) {
                        setNotif({ type:'success', msg:'Punto creado' });
                        const m = await fetch(`${API_URL}/mapa`);
                        if (m.ok) setPuntos(await m.json());
                        setMapForm({ nombre:'', descripcion:'', latitud:'', longitud:'', categoria:'' });
                        setShowCreatePointForm(false);
                        setMapaSubTab('listar');
                      } else setNotif({ type:'error', msg:'Error creando punto' });
                    }}>
                      <Save className="h-4 w-4"/> Guardar
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded" onClick={()=>{ setShowCreatePointForm(false); }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Listar puntos con opción de editar */}
          {mapaSubTab === 'listar' && (
            <div className="space-y-3">
              <h3 className="font-semibold mt-2">Puntos</h3>
              <ul className="space-y-2">
                {puntos.map(p => (
                  <li key={p.id} className="p-2 bg-white rounded shadow">
                    {(!(editPoint && editPoint.id === p.id)) ? (
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{p.nombre}</div>
                          <div className="text-xs text-gray-600">{p.descripcion} • [{p.latitud}, {p.longitud}] • {p.categoria}</div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded inline-flex items-center gap-2" onClick={() => {
                            setEditPoint(p);
                            setEditPointForm({ nombre: p.nombre || '', descripcion: p.descripcion || '', latitud: String(p.latitud ?? ''), longitud: String(p.longitud ?? ''), categoria: p.categoria || '' });
                          }}>
                            <Pencil className="h-4 w-4"/> Editar
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={async ()=>{
                            const token = localStorage.getItem('token');
                            const headers = { 'Authorization': `Bearer ${token}` };
                            const res = await fetch(`${API_URL}/admin/mapa/${p.id}`, { method:'DELETE', headers });
                            if (res.ok) { setNotif({ type:'success', msg:'Punto eliminado' }); const m = await fetch(`${API_URL}/mapa`); if (m.ok) setPuntos(await m.json()); }
                            else setNotif({ type:'error', msg:'Error eliminando punto' });
                          }}>Eliminar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {['nombre','descripcion','latitud','longitud','categoria'].map(k => (
                            <input key={k} className="border p-2 rounded" placeholder={k} value={editPointForm[k]} onChange={(e)=>setEditPointForm({ ...editPointForm, [k]: e.target.value })} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-600 text-white rounded inline-flex items-center gap-2" onClick={async ()=>{
                            const token = localStorage.getItem('token');
                            const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' };
                            const res = await fetch(`${API_URL}/admin/mapa/${p.id}`, { method:'PUT', headers, body: JSON.stringify(editPointForm) });
                            if (res.ok) {
                              setNotif({ type:'success', msg:'Punto actualizado' });
                              const m = await fetch(`${API_URL}/mapa`);
                              if (m.ok) setPuntos(await m.json());
                              setEditPoint(null);
                            } else setNotif({ type:'error', msg:'Error actualizando punto' });
                          }}>
                            <Save className="h-4 w-4"/> Guardar
                          </button>
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded inline-flex items-center gap-2" onClick={()=>{ setEditPoint(null); }}>
                            <X className="h-4 w-4"/> Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analítica IA: Heatmap de reportes */}
          {mapaSubTab === 'heatmap' && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                Mapa de calor (IA) de reportes
              </h3>

              <p className="text-sm text-gray-600">
                Esta vista solo está disponible para administradores. Agrupa los reportes recientes en zonas
                (clusters) para ayudarte a priorizar acciones en el campus.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Días a considerar</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    className="mt-1 w-full border p-2 rounded text-sm"
                    value={heatmapConfig.days}
                    onChange={(e) => setHeatmapConfig(cfg => ({ ...cfg, days: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Máximo de clusters (K)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="mt-1 w-full border p-2 rounded text-sm"
                    value={heatmapConfig.k}
                    onChange={(e) => setHeatmapConfig(cfg => ({ ...cfg, k: Number(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded inline-flex items-center gap-2 disabled:opacity-60"
                    disabled={heatmapLoading}
                    onClick={async () => {
                      try {
                        setHeatmapLoading(true);
                        setHeatmapError(null);
                        const token = localStorage.getItem('token');
                        const params = new URLSearchParams({
                          days: String(heatmapConfig.days || 30),
                          k: String(heatmapConfig.k || 4),
                        });
                        const res = await fetch(`${API_URL}/admin/heatmap/reportes?${params.toString()}`, {
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (!res.ok) {
                          throw new Error('No se pudo generar el heatmap');
                        }
                        const data = await res.json();
                        setHeatmapClusters(data.clusters || []);
                        setHeatmapPoints(data.points || []);
                        setHeatmapMeta(data.meta || null);
                      } catch (e) {
                        console.error(e);
                        setHeatmapError('Error al generar el heatmap.');
                      } finally {
                        setHeatmapLoading(false);
                      }
                    }}
                  >
                    <Save className="h-4 w-4" />
                    {heatmapLoading ? 'Calculando…' : 'Calcular heatmap'}
                  </button>
                </div>
              </div>

              {heatmapError && (
                <div className="p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  {heatmapError}
                </div>
              )}

              {heatmapClusters.length > 0 ? (
                <>
                  <div className="h-80 w-full rounded-lg overflow-hidden border border-gray-200">
                    <MapContainer
                      center={
                        (() => {
                          const c = heatmapClusters[0]?.center;
                          if (Array.isArray(c) && c.length === 2) {
                            return [Number(c[0]) || 0, Number(c[1]) || 0];
                          }
                          if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
                            return [c.lat, c.lng];
                          }
                          return [20.6555, -103.3255];
                        })()
                      }
                      zoom={17}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                  
                      {heatmapClusters.map(cluster => {
                        let centerArray = null;
                        if (Array.isArray(cluster.center)) {
                          centerArray = cluster.center;
                        } else if (cluster.center &&
                          typeof cluster.center.lat === 'number' &&
                          typeof cluster.center.lng === 'number') {
                          centerArray = [cluster.center.lat, cluster.center.lng];
                        }

                        if (!centerArray || centerArray.length !== 2) {
                          console.warn('Cluster sin centro válido para dibujar:', cluster);
                          return null;
                        }

                        const [lat, lng] = centerArray.map(Number);
                        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                          console.warn('Cluster con coordenadas inválidas:', cluster.center);
                          return null;
                        }

                        const severityColor = getClusterColor(cluster.score || 0);
                        // Radio ajustado para CUCEI: puntos muy cercanos, círculos más pequeños
                        const baseRadius = 60; // metros
                        const radiusPerReporte = 15; // metros extra por reporte en el cluster
                        const radius = baseRadius + (cluster.count || 1) * radiusPerReporte;
                        return (
                          <React.Fragment key={cluster.id}>
                            <Circle
                              center={[lat, lng]}
                              radius={radius}
                              pathOptions={{
                                color: severityColor,
                                weight: 3,
                                fillColor: severityColor,
                                fillOpacity: 0.4,
                              }}
                            >
                              <Popup>
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Zona prioritaria #{cluster.id + 1}</strong>
                                  <br />
                                  Reportes: {cluster.count}
                                  {cluster.topTipo && (
                                    <>
                                      <br />
                                      Tipo dominante: {cluster.topTipo}
                                    </>
                                  )}
                                </div>
                              </Popup>
                            </Circle>
                          </React.Fragment>
                        );
                      })}
                    </MapContainer>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-red-700" />
                      Muy alta urgencia
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      Alta urgencia
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-yellow-400" />
                      Urgencia media
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      Urgencia baja
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {heatmapMeta && (
                      <div className="text-xs text-gray-600 mb-1">
                        Zonas encontradas: <strong>{heatmapMeta.clustersFound ?? heatmapClusters.length}</strong> de un máximo de{' '}
                        <strong>{heatmapMeta.kMax ?? heatmapMeta.k ?? heatmapClusters.length}</strong>. Reportes considerados: <strong>{heatmapMeta.totalReportes}</strong> en los
                        últimos <strong>{heatmapMeta.days}</strong> días.
                      </div>
                    )}
                    {heatmapClusters.map(cluster => (
                      <div
                        key={cluster.id}
                        className="p-3 rounded border border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                      >
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            Zona prioritaria #{cluster.id + 1}
                          </div>
                          <div className="text-xs text-gray-600">
                            Centro aproximado: [
                            {Array.isArray(cluster.center) ? cluster.center[0].toFixed(5) : '?'} ,{' '}
                            {Array.isArray(cluster.center) ? cluster.center[1].toFixed(5) : '?'}]
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Reportes en la zona: <strong>{cluster.count}</strong>
                            {cluster.topTipo && (
                              <span className="ml-2">• Tipo dominante: <strong>{cluster.topTipo}</strong></span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>
                            Intensidad estimada: <strong>{Math.round(cluster.score || 0)}</strong>
                          </div>
                          {typeof cluster.avgRecencyDays === 'number' && (
                            <div>
                              Antigüedad promedio: ~{cluster.avgRecencyDays.toFixed(1)} días
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                !heatmapLoading && (
                  <p className="text-sm text-gray-500">
                    No hay datos suficientes (o no se han generado clusters todavía) para mostrar un mapa de calor.
                  </p>
                )
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
