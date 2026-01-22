import React from 'react';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';

/**
 * COMPONENTE: EventosView
 * Muestra la lista de eventos disponibles en la plataforma.
 * Permite seleccionar un evento para ver sus detalles.
 */
const EventosView = ({ data, onSelectEvento }) => (
    <section className="relative bg-gradient-to-b from-green-100 to-green-50 min-h-screen overflow-hidden py-12">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-5">
            {/* Decoración de fondo */}
        </div>

        <div className="relative container mx-auto px-4">
            {/* Título con diseño EcoJuego */}
            <div className="mb-12 text-white rounded-lg shadow-lg p-4 relative overflow-hidden" style={{ backgroundColor: '#9DBFA5' }}>
                {/* Hojas cayendo : ANIMACION*/}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '10%', animationDelay: '0s'}}>🍃</div>
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '25%', animationDelay: '1s'}}>🍂</div>
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '40%', animationDelay: '0.5s'}}>🍃</div>
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '60%', animationDelay: '1.5s'}}>🍂</div>
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '75%', animationDelay: '0.8s'}}>🍃</div>
                    <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '90%', animationDelay: '1.2s'}}>🍂</div>
                </div>
                
                <div className="relative z-10 text-center">
                    <h2 className="text-3xl font-bold mb-2">Próximos Eventos</h2>
                    <p className="text-sm font-semibold text-green-50">Actividades y encuentros en CUCEI</p>
                </div>
            </div>

            {/* eventos listado */}
            {data && data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {data.map(evento => (
                        <div
                            key={evento.id}
                            onClick={() => onSelectEvento(evento)}
                            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        >
                            {/* diseño de la tarjeta de eventos */}
                            <div className="h-16 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center border-b-4 border-white">
                                <div className="text-2xl">🌿</div>
                            </div>
                            
                            {/* Contenido de la tarjeta de eventos */}
                            <div className="p-3">
                                <h4 className="text-sm font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                                    {evento.title}
                                </h4>
                                
                                <div className="space-y-1 mb-3 text-xs text-gray-600">
                                    <div className="flex items-start space-x-1">
                                        <Calendar className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span className="line-clamp-1">{evento.date} {evento.time}</span>
                                    </div>
                                    <div className="flex items-start space-x-1">
                                        <MapPin className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span className="line-clamp-1">{evento.location}</span>
                                    </div>
                                </div>
                                
                                <p className="text-gray-700 text-xs mb-2 line-clamp-2">
                                    {evento.description}
                                </p>
                                
                                {/* Botón de acción */}
                                <button className="w-full bg-green-500 text-white py-1 text-xs rounded-lg font-semibold hover:bg-green-600 transition-colors">
                                    Ver Detalles →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 text-center text-white">
                    <p className="text-lg">No hay eventos disponibles en este momento</p>
                </div>
            )}
        </div>
    </section>
);
//Redireccion a la vista de detalles de eventos
const EventoDetallesView = ({ evento, onBack }) => (
    <section className="bg-gradient-to-b from-green-50 to-white min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl">
            {/* Botón Atrás */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Volver a Eventos
            </button>

            {/* Card Principal */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Header con color */}
                <div className="h-24 bg-gradient-to-r from-green-600 to-green-500 flex items-center justify-center">
                    <div className="text-4xl">🌿</div>
                </div>

                {/* Contenido */}
                <div className="p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{evento.title}</h1>
                    
                    {/* Información */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Fecha</p>
                                <p className="text-lg font-semibold text-gray-800">{evento.date}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Hora</p>
                                <p className="text-lg font-semibold text-gray-800">{evento.time}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 md:col-span-2">
                            <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-gray-600">Ubicación</p>
                                <p className="text-lg font-semibold text-gray-800">{evento.location}</p>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Descripción</h2>
                        <p className="text-gray-700 leading-relaxed">{evento.description}</p>
                    </div>

                </div>
            </div>
        </div>
    </section>
);

export { EventosView, EventoDetallesView };
