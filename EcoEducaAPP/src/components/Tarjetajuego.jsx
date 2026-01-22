import React from "react";

const TarjetaJuego = ({ titulo, descripcion, juegoKey, onSelectJuego }) => (
  <div
    className="w-48 h-40 border-2 border-gray-700 rounded-lg p-4 flex flex-col justify-center items-center text-center bg-gray-100 cursor-pointer hover:scale-105 hover:shadow-lg transition-transform"
    onClick={() => onSelectJuego(juegoKey)}
  >
    <h3 className="font-bold text-lg mb-2">{titulo}</h3>
    <p className="text-sm">{descripcion}</p>
  </div>
);


export default TarjetaJuego;
