import React, { useState } from 'react';
import { TreePine } from 'lucide-react';
import './calendario.css';

const CalendarioView = ({ data }) => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [viewMode, setViewMode] = useState('month'); 

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dayNames = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const parseDate = (dateString) => {
        const partes = dateString.split('-');
        if (partes.length === 3) {
            return {
                año: parseInt(partes[0]),
                mes: parseInt(partes[1]) - 1, 
                dia: parseInt(partes[2])
            };
        }
        const date = new Date(dateString);
        return {
            año: date.getFullYear(),
            mes: date.getMonth(),
            dia: date.getDate()
        };
    };

    const getEventosDelDia = (dia, mes, año) => {
        return data.filter(evento => {
            const eventoDate = parseDate(evento.date);
            return eventoDate.dia === dia && eventoDate.mes === mes && eventoDate.año === año;
        });
    };

    // Función para determinar el color del día según el tipo de evento
    const getColorDelDia = (dia, mes, año) => {
        const eventosDelDia = getEventosDelDia(dia, mes, año);
        if (eventosDelDia.length === 0) {
            const isToday = new Date().getDate() === dia && 
                           new Date().getMonth() === mes &&
                           new Date().getFullYear() === año;
            return isToday ? { border: 'border-yellow-400', bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Día actual' } : { border: 'border-gray-200', bg: 'bg-white', text: 'text-gray-800' };
        }

        // Obtener el tipo de evento principal (prioridad: ambiental > nacional/festivo > importante > evento)
        const tipos = eventosDelDia.map(e => e.type);
        if (tipos.includes('ambiental')) return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', badgeBg: 'bg-green-500', label: 'Ambiental' };
        if (tipos.includes('festivo') || tipos.includes('nacional')) return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', badgeBg: 'bg-red-500', label: 'Festivo' };
        if (tipos.includes('importante')) return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', badgeBg: 'bg-blue-500', label: 'Importante' };
        return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-600', badgeBg: 'bg-green-500', label: 'Evento' };
    };

    // Función para obtener eventos de una semana
    const getEventosDeLaSemana = (fecha) => {
        const startOfWeek = new Date(fecha);
        startOfWeek.setDate(fecha.getDate() - fecha.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return data.filter(evento => {
            const eventDate = new Date(evento.date);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
    };

    // Obtener primer día del mes y número de días
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const prevWeek = () => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    const nextWeek = () => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));

    // VISTA MES
    const renderMes = () => {
        const days = [];
        
        // Días del mes anterior
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <div key={`prev-${i}`} className="p-1 bg-gray-50 rounded-sm border border-gray-200 h-16 text-xs flex flex-col justify-center items-center">
                    <p className="text-gray-300 font-bold text-sm">{daysInPrevMonth - i}</p>
                </div>
            );
        }
        
        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            const eventosDelDia = getEventosDelDia(i, currentDate.getMonth(), currentDate.getFullYear());
            const colorInfo = getColorDelDia(i, currentDate.getMonth(), currentDate.getFullYear());
            const isToday = new Date().getDate() === i && 
                           new Date().getMonth() === currentDate.getMonth() &&
                           new Date().getFullYear() === currentDate.getFullYear();

            days.push(
                <div key={i} className={`p-1 rounded-sm border-2 h-16 cursor-pointer transition-all duration-300 day-card flex flex-col justify-start items-center overflow-hidden ${
                    colorInfo.border} ${colorInfo.bg} ${eventosDelDia.length > 0 ? 'pulse-glow' : 'hover:border-green-400'
                }`}>
                    <p className={`font-bold text-sm mb-0.5 ${colorInfo.text}`}>{i}</p>
                    {eventosDelDia.length > 0 && (
                        <div className="space-y-0.5 w-full px-0.5">
                            {eventosDelDia.slice(0, 1).map((evento, idx) => (
                                <div key={idx} className={`text-xs text-white rounded px-1 py-0.5 flex items-center gap-1 w-full ${colorInfo.badgeBg}`}>
                                    <TreePine size={12} className="flex-shrink-0" />
                                    <span className="truncate">{evento.title}</span>
                                </div>
                            ))}
                            {eventosDelDia.length > 1 && (
                                <p className={`text-xs font-bold`} style={{color: colorInfo.text === 'text-green-600' ? '#16a34a' : colorInfo.text === 'text-red-600' ? '#dc2626' : colorInfo.text === 'text-blue-600' ? '#2563eb' : '#1f2937'}}>+{eventosDelDia.length - 1}</p>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        
        // Días del próximo mes
        for (let i = 1; i <= (42 - days.length); i++) {
            days.push(
                <div key={`next-${i}`} className="p-1 bg-gray-50 rounded-sm border border-gray-200 h-16 text-xs flex flex-col justify-center items-center">
                    <p className="text-gray-300 font-bold text-sm">{i}</p>
                </div>
            );
        }

        return (
            <>
                <div className="grid grid-cols-7 gap-0 mb-0 text-center font-bold text-gray-700 text-xs">
                    {dayNames.map(day => <div key={day} className="py-1 h-6 flex items-center justify-center border-b border-gray-200">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-0 mb-4">
                    {days}
                </div>
            </>
        );
    };

    // VISTA SEMANA
    const renderSemana = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const dia = new Date(startOfWeek);
            dia.setDate(startOfWeek.getDate() + i);
            weekDays.push(dia);
        }

        return (
            <div className="space-y-3">
                <div className="grid grid-cols-7 gap-1 mb-3">
                    {weekDays.map((dia, idx) => {
                        const eventosDelDia = getEventosDelDia(dia.getDate(), dia.getMonth(), dia.getFullYear());
                        const isToday = new Date().toDateString() === dia.toDateString();
                        
                        return (
                            <div key={idx} className={`p-2 rounded-lg border-2 text-center transition-all duration-300 day-card text-xs ${
                                isToday ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-400'
                            }`}>
                                <p className="font-bold text-xs text-gray-600">{dayNames[dia.getDay()]}</p>
                                <p className={`text-lg font-bold ${isToday ? 'text-green-600' : 'text-gray-800'}`}>
                                    {dia.getDate()}
                                </p>
                                <p className="text-xs text-gray-500">{monthNames[dia.getMonth()]}</p>
                                {eventosDelDia.length > 0 && (
                                    <div className="mt-1 pt-1 border-t border-green-200">
                                        <span className="inline-block bg-green-500 text-white text-xs rounded-full px-1.5 py-0.5 text-xs">
                                            {eventosDelDia.length}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Eventos de la semana */}
                <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-bold text-gray-800 mb-2"> Eventos de esta semana</h4>
                    {getEventosDeLaSemana(currentDate).length === 0 ? (
                        <p className="text-xs text-gray-500">No hay eventos esta semana</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {getEventosDeLaSemana(currentDate).map((evento, idx) => (
                                <div key={idx} className="bg-green-100 border-l-4 border-green-500 p-2 rounded text-xs">
                                    <h5 className="font-bold text-gray-800 text-xs">{evento.title}</h5>
                                    <p className="text-xs text-gray-600">📅 {evento.date} {evento.time}</p>
                                    <p className="text-xs text-gray-600">📍 {evento.location}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // VISTA DÍA
    const renderDia = () => {
        const eventosDelDia = getEventosDelDia(currentDate.getDate(), currentDate.getMonth(), currentDate.getFullYear());

        return (
            <div className="space-y-3">
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{currentDate.getDate()}</h3>
                    <p className="text-lg text-gray-600">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</p>
                    <p className="text-sm text-gray-500">{dayNames[currentDate.getDay()]}</p>
                </div>

                {eventosDelDia.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">No hay eventos este día</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {eventosDelDia.map((evento, idx) => (
                            <div key={idx} className="bg-green-100 border-l-4 border-green-500 p-3 rounded-lg">
                                <h4 className="text-sm font-bold text-gray-800 mb-1">{evento.title}</h4>
                                <div className="space-y-0.5 text-xs text-gray-700">
                                    <p>🕐 {evento.time}</p>
                                    <p>📍 {evento.location}</p>
                                    <p className="mt-1">{evento.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    //DECORACION DE SECTION CALENDARIO
    return (
        <div className="container mx-auto px-3 py-6 max-w-7xl view-transition">
            <div className="mb-8">
                <div className="text-white rounded-lg shadow-lg p-4 mb-6 relative overflow-hidden" style={{ backgroundColor: '#9DBFA5' }}>
                    {/* Hojas cayendo */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '10%', animationDelay: '0s'}}>🍃</div>
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '25%', animationDelay: '1s'}}>🍂</div>
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '40%', animationDelay: '0.5s'}}>🍃</div>
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '60%', animationDelay: '1.5s'}}>🍂</div>
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '75%', animationDelay: '0.8s'}}>🍃</div>
                        <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '90%', animationDelay: '1.2s'}}>🍂</div>
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-center mb-2"> CALENDARIO</h2>
                        <p className="text-center text-green-50 text-sm font-semibold">Eventos, actividades y talleres de CUCEI</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 view-transition">
                <div className="lg:col-span-3 bg-white rounded-2xl shadow-2xl p-6 border-t-4 border-green-500">
                   
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 pb-4 border-b-2 border-gray-100">
                        <div className="flex gap-2">
                            <button onClick={viewMode === 'month' ? prevMonth : prevWeek} 
                                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:shadow-lg">
                                ‹ Anterior
                            </button>
                            <button 
                                onClick={() => setCurrentDate(new Date())}
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:shadow-lg float-animation">
                                 Hoy
                            </button>
                            <button onClick={viewMode === 'month' ? nextMonth : nextWeek} 
                                className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 hover:shadow-lg">
                                Siguiente ›
                            </button>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-800 bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                            {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                            {viewMode === 'week' && `Semana de ${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]}`}
                            {viewMode === 'day' && `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`}
                        </h3>

                        <div className="flex gap-2 flex-wrap justify-center">
                            {['Mes', 'Semana', 'Día'].map((mode, idx) => (
                                <button key={mode} 
                                    onClick={() => setViewMode(['month', 'week', 'day'][idx])} 
                                    className={`px-3 py-1 rounded text-sm font-semibold transition-all duration-300 transform btn-view ${
                                        viewMode === ['month', 'week', 'day'][idx] 
                                            ? 'bg-green-600 text-white shadow-lg scale-105' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-102'
                                    }`}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contenido según vista */}
                    <div className="border-t pt-4">
                        {viewMode === 'month' && renderMes()}
                        {viewMode === 'week' && renderSemana()}
                        {viewMode === 'day' && renderDia()}
                    </div>
                </div>

                {/* LISTA DE EVENTOS - 1/4 */}
                <div className={`lg:col-span-1 rounded-lg shadow-lg p-4 h-fit ${
                    data.filter(evento => {
                        const eventoDate = parseDate(evento.date);
                        return eventoDate.mes === currentDate.getMonth() &&
                               eventoDate.año === currentDate.getFullYear();
                    }).length > 0 ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50'
                }`}>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 border-b-2 border-green-500 pb-2">
                        📅 {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h4>
                    
                    {data.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">Sin eventos</p>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {/* Filtrar eventos del mes actual */}
                            {data.filter(evento => {
                                const eventoDate = parseDate(evento.date);
                                return eventoDate.mes === currentDate.getMonth() &&
                                       eventoDate.año === currentDate.getFullYear();
                            }).map((evento, idx) => (
                                <div key={idx} className="bg-white border-l-4 border-blue-500 p-2 rounded hover:shadow-md transition cursor-pointer">
                                    <h5 className="font-bold text-gray-800 text-xs truncate">{evento.title}</h5>
                                    <p className="text-xs text-gray-600 mt-0.5">📅 {evento.date}</p>
                                    {evento.time && <p className="text-xs text-gray-600">🕐 {evento.time}</p>}
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{evento.location}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Resumen */}
                    <div className="mt-4 pt-3 border-t-2 border-green-300">
                        <p className="text-xs text-gray-700 font-semibold">
                             Total: {data.filter(evento => {
                                const eventoDate = parseDate(evento.date);
                                return eventoDate.mes === currentDate.getMonth() &&
                                       eventoDate.año === currentDate.getFullYear();
                            }).length} eventos
                        </p>
                    </div>

                    {/* Simbología */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        <p className="text-xs font-bold text-gray-800 mb-2">Simbología:</p>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                                <span className="text-xs text-gray-600">Día actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-xs text-gray-600">Actividades/Talleres ambientales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span className="text-xs text-gray-600">Días Festivos</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-xs text-gray-600">Fechas importantes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarioView;
