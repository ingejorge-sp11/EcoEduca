import React, { useState, useEffect } from "react";
import banana from '../assets/objetos/banana.png';
import manzana from '../assets/objetos/manzana.png';
import naranja from '../assets/objetos/naranja.png';
import huevo from '../assets/objetos/huevo.png';
import paisaje2 from '../assets/paisaje2.0.jpg';

export default function JuegoResiduos() {
	const [consejo, setConsejo] = useState("");
  const [puntaje, setPuntaje] = useState(0);
  const [mejorPuntuacion, setMejorPuntuacion] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [objetosEnPantalla, setObjetosEnPantalla] = useState([]);
  const [userId, setUserId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [tiempoRestante, setTiempoRestante] = useState(60); 
  const [timerActive, setTimerActive] = useState(false);
  const [objetoSeleccionado, setObjetoSeleccionado] = useState(null);

  const objetos = [
  { nombre: "Cáscara de banana", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/banana.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9iYW5hbmEucG5nIiwiaWF0IjoxNzczNjI5MzQ5LCJleHAiOjE4MDUxNjUzNDl9.lARSju3dAJHVvHt4km-uq-USWsd0hFMIU0ahWWvIKsk" },
  { nombre: "Bolsa de té", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/bolsate.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9ib2xzYXRlLnBuZyIsImlhdCI6MTc3MzYyOTM5NywiZXhwIjoxODA1MTY1Mzk3fQ.wDWV341rLxqmYkWHD4fskGaVig38ITqoe1pI1Pk46QY" },
  { nombre: "Cáscara de nuez", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/cascara%20nuez.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9jYXNjYXJhIG51ZXoucG5nIiwiaWF0IjoxNzczNjI5NTE5LCJleHAiOjE4MDUxNjU1MTl9.uApfDT1ezjamN-pP12zruoESzWvHWZIwbTc4r1pQipw" },
  { nombre: "Hueso roto", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/hueso_roto.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9odWVzb19yb3RvLnBuZyIsImlhdCI6MTc3MzYyOTU1OCwiZXhwIjoxODA1MTY1NTU4fQ.3_mS5hUf1sr86bUuHEfzSYjXOOUZFnEZVYu3WVmsoMs" },
  { nombre: "Cáscara de huevo", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/huevo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9odWV2by5wbmciLCJpYXQiOjE3NzM2Mjk1NjksImV4cCI6MTgwNTE2NTU2OX0.AUTBEQiRY8q70pBEPmCnDpnlArK5MEseJwP3ep14ks0" },
  { nombre: "Restos de manzana", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/manzana.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9tYW56YW5hLnBuZyIsImlhdCI6MTc3MzYyOTU4MywiZXhwIjoxODA1MTY1NTgzfQ.wsSPTxznrTVpShch4MzuUrZnidkmXKfp6BD9WsjKITQ" },
  { nombre: "Cáscara de naranja", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/naranja.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9uYXJhbmphLnBuZyIsImlhdCI6MTc3MzYyOTU5NCwiZXhwIjoxODA1MTY1NTk0fQ.XQMXPiZ_6YYWhmMAZgHD9hsj1sZnSqGE-rALl_c6DuA" },
  { nombre: "Pozo de café", categoria: "organico", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/pozo%20de%20cafe.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9wb3pvIGRlIGNhZmUucG5nIiwiaWF0IjoxNzczNjI5NjM2LCJleHAiOjE4MDUxNjU2MzZ9.mRhi1umEawH2s8_XSe1VaZCdhFXON7Tjwwyr2GWk8iY" },
  { nombre: "Bolsa de papas", categoria: "vidrio", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/bolsa%20de%20papas.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9ib2xzYSBkZSBwYXBhcy5wbmciLCJpYXQiOjE3NzM2MjkzODUsImV4cCI6MTgwNTE2NTM4NX0.rDvT8JJmTgsgfUgRe6H-7oInIKYnRH2c5RIGy43ur9o" },
  { nombre: "Botella de aceite", categoria: "vidrio", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/botella%20de%20aceite.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9ib3RlbGxhIGRlIGFjZWl0ZS5wbmciLCJpYXQiOjE3NzM2Mjk0MjgsImV4cCI6MTgwNTE2NTQyOH0.96IXt4WWrYLyRQfi_BY0016oumydhQJ8pdRpCYOa5Eg" },
  { nombre: "Botella de agua", categoria: "vidrio", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/botella%20de%20agua.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9ib3RlbGxhIGRlIGFndWEucG5nIiwiaWF0IjoxNzczNjI5NDQyLCJleHAiOjE4MDUxNjU0NDJ9.0HkuEjwV-VnvohiUECimQ3irPzDhP7iu-W_sep0X-3I" },
  { nombre: "Botella rota", categoria: "vidrio", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Botella%20rota.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9Cb3RlbGxhIHJvdGEucG5nIiwiaWF0IjoxNzczNjI5NDU0LCJleHAiOjE4MDUxNjU0NTR9.USBMHVxeLpU4FzXLxZAoCmYwXRh4bvzP1UPzXz3dsOg" },
  { nombre: "Cartas", categoria: "reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/cartas.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9jYXJ0YXMucG5nIiwiaWF0IjoxNzczNjI5NDk2LCJleHAiOjE4MDUxNjU0OTZ9.3oHlAN-Y_4tPwVloG4SWkD95c_StuFKjkpdeJ9WA5KY" },
  { nombre: "Periódico", categoria: "reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/periodico.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9wZXJpb2RpY28ucG5nIiwiaWF0IjoxNzczNjI5NjEwLCJleHAiOjE4MDUxNjU2MTB9.pkaKygfp29IjQ-gbzTURNYYycO4RPO0R5fmx2mYxVys" },
  { nombre: "Aceite de motor usado", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/aceite%20de%20motor%20usado.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9hY2VpdGUgZGUgbW90b3IgdXNhZG8ucG5nIiwiaWF0IjoxNzczNjI5MzM1LCJleHAiOjE4MDUxNjUzMzV9.dACD8mNmCaY-3jx3UwKeB0iYT8ORueJsqZHQ8Uq5yqE" },
  { nombre: "Bombilla de bajo consumo", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Bombilla%20de%20bajo%20consumo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9Cb21iaWxsYSBkZSBiYWpvIGNvbnN1bW8ucG5nIiwiaWF0IjoxNzczNjI5NDA5LCJleHAiOjE4MDUxNjU0MDl9.fabcYsS3wDZl59ZDTwEioFukI8TdqxyLsW9vA1clq54" },
  { nombre: "Cartucho de tinta", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Cartucho%20de%20tinta.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9DYXJ0dWNobyBkZSB0aW50YS5wbmciLCJpYXQiOjE3NzM2Mjk1MDcsImV4cCI6MTgwNTE2NTUwN30.C3qOlPzqkmt0wgdNSw-undzcMUZNy5RtmIDJJZ-u4PY" },
  { nombre: "Pila alcalina usada", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Pila%20alcalina%20usada.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9QaWxhIGFsY2FsaW5hIHVzYWRhLnBuZyIsImlhdCI6MTc3MzYyOTYyMSwiZXhwIjoxODA1MTY1NjIxfQ.HhdnLqzncjwdejCNJSixrTOTxJPuydLgawRpzQAAb_I" },
  { nombre: "Spray de insecticida", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Spray%20de%20incecticida.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9TcHJheSBkZSBpbmNlY3RpY2lkYS5wbmciLCJpYXQiOjE3NzM2Mjk2NTgsImV4cCI6MTgwNTE2NTY1OH0.sNku9I4kBn16chppGvZy6RfUvDWwbreZN0s10262u5E" },
  { nombre: "Termómetro de mercurio", categoria: "peligroso", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Termometro%20de%20mercurio.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9UZXJtb21ldHJvIGRlIG1lcmN1cmlvLnBuZyIsImlhdCI6MTc3MzYyOTY3MSwiZXhwIjoxODA1MTY1NjcxfQ.GmBV9NoRkZ3MUJIUnjrz84s0Izh0MZR-fTYXTX5zyM4" },
  { nombre: "Bolígrafo usado", categoria: "no_reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Boligrafo%20usado.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9Cb2xpZ3JhZm8gdXNhZG8ucG5nIiwiaWF0IjoxNzczNjI5MzY2LCJleHAiOjE4MDUxNjUzNjZ9.Xo8Xe1LSsICN1fSpp_gnBxEZMCUcJlbVa8NRB6SdJyE" },
  { nombre: "Camisa vieja", categoria: "no_reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Camisa%20vieja.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9DYW1pc2EgdmllamEucG5nIiwiaWF0IjoxNzczNjI5NDY1LCJleHAiOjE4MDUxNjU0NjV9.--OVsv21XDz-WrQe3MJayO6GdC_8-8KbgbJXZd4vX-o" },
  { nombre: "Chicle masticado", categoria: "no_reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Chicle%20masticado.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9DaGljbGUgbWFzdGljYWRvLnBuZyIsImlhdCI6MTc3MzYyOTUzMiwiZXhwIjoxODA1MTY1NTMyfQ.oPHDF_yXJNy6gzOdfKuSccveYVcDC7rzbzCTNPWitio" },
  { nombre: "Colilla de cigarro", categoria: "no_reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Colilla%20de%20cigarro.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9Db2xpbGxhIGRlIGNpZ2Fycm8ucG5nIiwiaWF0IjoxNzczNjI5NTQ0LCJleHAiOjE4MDUxNjU1NDR9.O8gcEZMHvzkYeBDypl9ALupEFiPS2CxTghIMTGn2S1I" },
  { nombre: "Ropa usada", categoria: "no_reciclable", imagen: "https://xkdhffhaceflgmmgjmzn.supabase.co/storage/v1/object/sign/products/Ropa%20usada.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80OTk4NTk1ZC03MWM5LTRiYTctYTdmYS0wMTU0ZGU3ZmY0ZGQiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9Sb3BhIHVzYWRhLnBuZyIsImlhdCI6MTc3MzYyOTY0NywiZXhwIjoxODA1MTY1NjQ3fQ.8cBvce6PpjzfSRPOhc-KkKh5ckCn2aYdYYlqk9x5CMc" }
];

  const contenedoresConfig = {
    organico: { emoji: "🍃", color: "#7CAB70", label: "ORGÁNICO" },
    reciclable: { emoji: "♻️", color: "#7BA3D0", label: "PAPEL Y CARTÓN" },
    vidrio: { emoji: "🧪", color: "#E6C94F", label: "PLÁSTICO" },
    peligroso: { emoji: "☣️", color: "#E08080", label: "PELIGROSO" },
    no_reciclable: { emoji: "🚯", color: "#A9A9A9", label: "NO RECICLABLE" },
  };

  const generarObjetos = async () => {
    const nuevosObjetos = [];
    for (let i = 0; i < 8; i++) {
      const objeto = objetos[Math.floor(Math.random() * objetos.length)];
      nuevosObjetos.push({
        ...objeto,
        id: Math.random(),
        posX: Math.random() * 85 + 7.5,
        posY: Math.random() * 40 + 35,
      });
    }
    return nuevosObjetos;
  };

  useEffect(() => {
    (async () => {
      // Preferir userId desde localStorage para consistencia
      try {
        const u = JSON.parse(localStorage.getItem('user'));
        if (u && (u.id || u._id)) {
          setUserId(u.id || u._id);
        }
      } catch (_) {}
      // Obtener usuario del token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Intentar primero el endpoint estable /v1/users/profile
          const profileResponse = await fetch('/api/v1/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileResponse.ok) {
            const profile = await profileResponse.json();
            // console.debug('Perfil /v1/users/profile:', profile);
            setUserId(prev => prev ?? profile.id);
            setMejorPuntuacion(profile.puntuacion || 0);
            } else {
            // Fallback a /usuarios/me solo si el perfil falla
            const userResponse = await fetch('/api/usuarios/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              // console.debug('Perfil /usuarios/me:', userData);
              setUserId(prev => prev ?? userData.id);
              setMejorPuntuacion(userData.puntuacion || 0);
            } else {
              // Evitar logs ruidosos en producción, solo aviso mínimo
              // console.warn('No se pudo obtener perfil de usuario (me/profile).');
            }
          }
        } catch (err) {
          // console.warn('Error obteniendo datos del usuario:', err);
        }
      }
      // Generar objetos iniciales
      const objetosIniciales = await generarObjetos();
      setObjetosEnPantalla(objetosIniciales);
      setCargando(false);
      setTimerActive(true);
      setTiempoRestante(60);
    })();
  }, []);

  // Obtener consejo cuando termina el juego
  useEffect(() => {
    if (gameOver) {
      fetch('/api/consejo-aleatorio')
        .then(res => res.json())
        .then(data => setConsejo(data.descripcion || ""))
        .catch(() => setConsejo(""));

      // Registrar puntos del día para Misiones Diarias
      try {
        const hoyISO = new Date().toISOString().slice(0, 10);
        const actual = puntajeFinal || puntaje;
        const uid = userId ?? 'anon';
        const key = `residuos_puntos_${hoyISO}_u${uid}`;
        const almacenado = Number(localStorage.getItem(key)) || 0;
        const mejorDelDia = Math.max(almacenado, actual);
        localStorage.setItem(key, mejorDelDia);
      } catch (_) {
        // Ignorar errores de localStorage
      }
    }
  }, [gameOver]);

  // Temporizador
  useEffect(() => {
    let interval = null;
    if (timerActive && !gameOver) {
      interval = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            setPuntajeFinal(puntaje);
            setMensaje("⏰ ¡Se acabó el tiempo!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver, puntaje]);

  // Lógica central de clasificación (usada por drag & drop y por taps en móvil)
  const resolverClasificacion = (objetoActual, categoria) => {
    if (!objetoActual) return;
    if (objetoActual.categoria === categoria) {
      // ACIERTO
      setPuntaje((prev) => prev + 10);
      setMensaje(`✅ ¡Correcto! ${objetoActual.nombre}`);

      const nuevosObjetos = objetosEnPantalla.filter(
        (obj) => obj.id !== objetoActual.id
      );

      if (nuevosObjetos.length === 0) {
        (async () => {
          const objetos = await generarObjetos();
          setObjetosEnPantalla(objetos);
        })();
      } else {
        setObjetosEnPantalla(nuevosObjetos);
      }

      setTimeout(() => setMensaje(""), 1000);
    } else {
      // ERROR - Guardar puntaje en BD si es mayor al anterior
      setGameOver(true);
      setPuntajeFinal(puntaje);
      setMensaje(`❌ Error: ${objetoActual.nombre} NO va aquí`);
      
      if (puntaje > mejorPuntuacion && userId) {
        guardarPuntaje(puntaje);
      } else if (puntaje > mejorPuntuacion) {
        setMejorPuntuacion(puntaje);
      }
    }
  };

  const handleDrop = (e, categoria) => {
    e.preventDefault();
    if (gameOver || objetosEnPantalla.length === 0) return;

    const data = e.dataTransfer.getData("text");
    if (!data) return;

    const objetoActual = JSON.parse(data);
    resolverClasificacion(objetoActual, categoria);
  };

  // Soporte para móvil: tocar objeto y luego tocar contenedor
  const handleContainerClick = (categoria) => {
    if (gameOver || objetosEnPantalla.length === 0) return;
    if (!objetoSeleccionado) return;
    resolverClasificacion(objetoSeleccionado, categoria);
    setObjetoSeleccionado(null);
  };

  const guardarPuntaje = async (puntos) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/usuarios/me/guardar-mejor-puntaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ puntos })
      });

      if (response.ok) {
        const data = await response.json();
        setMejorPuntuacion(data.mejorPuntuacionActual || puntos);
      }
    } catch (err) {
      console.error('Error guardando puntaje:', err);
    }
  };

  const reiniciarJuego = async () => {
    setPuntaje(0);
    setGameOver(false);
    setPuntajeFinal(0);
    setMensaje("");
    setTiempoRestante(60);
    setTimerActive(true);
    const nuevosObjetos = await generarObjetos();
    setObjetosEnPantalla(nuevosObjetos);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col p-3 overflow-hidden">
      {/* Header */}
      <div className="text-white rounded-lg shadow-lg p-2 mb-2 relative overflow-hidden" style={{ backgroundColor: '#9DBFA5' }}>
        {/* Hojas cayendo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '10%', animationDelay: '0s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '25%', animationDelay: '1s'}}>🍂</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '40%', animationDelay: '0.5s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '60%', animationDelay: '1.5s'}}>🍂</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '75%', animationDelay: '0.8s'}}>🍃</div>
          <div className="absolute text-2xl opacity-70 animate-fall-leaf" style={{left: '90%', animationDelay: '1.2s'}}>🍂</div>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-xl font-bold">🌍 EcoJuego</h1>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-xs font-semibold text-green-50">Puntaje</p>
              <p className="text-2xl font-bold">{puntaje}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-yellow-50">Mejor</p>
              <p className="text-2xl font-bold">🏆 {mejorPuntuacion}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-blue-50">Tiempo</p>
              <p className="text-2xl font-bold">⏰ {`${Math.floor(tiempoRestante/60)}:${(tiempoRestante%60).toString().padStart(2,'0')}`}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-green-50 relative z-10">• Arrastra los residuos al contenedor correcto • Clasifica correctamente para ganar puntos</p>
      </div>

      {/* Mensaje flotante */}
      {mensaje && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-5 py-2 text-base font-bold z-50 border-2 border-green-400">
          {mensaje}
        </div>
      )}

      {!gameOver ? (
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {/* Área de juego con fondo */}
          <div 
            className="w-full h-full rounded-lg shadow-xl relative border-4 border-green-600 overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${paisaje2})`,
            }}
          >
            {/* Contenedores en la parte inferior (scroll horizontal en móvil) */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 px-3 overflow-x-auto">
              {Object.entries(contenedoresConfig).map(([id, config]) => (
                <div
                  key={id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, id)}
                  onClick={() => handleContainerClick(id)}
                  className="group cursor-pointer flex-1 max-w-xs"
                >
                  {/* Bote de basura */}
                  <div className="transform transition-all hover:scale-110 relative">
                    {/* Tapa */}
                    <div
                      className="rounded-t-full px-3 py-1 text-center shadow-md"
                      style={{ backgroundColor: config.color }}
                    >
                      <div className="text-xl">{config.emoji}</div>
                    </div>
                    
                    {/* Cuerpo */}
                    <div
                      className="rounded-b-2xl px-3 py-2 text-center border-l-4 border-r-4 border-b-4 border-gray-800 shadow-lg"
                      style={{ 
                        backgroundColor: config.color,
                        filter: 'brightness(0.85)'
                      }}
                    >
                      <p className="text-white font-bold text-xs">{config.label}</p>
                    </div>

                    {/* Línea de apertura */}
                    <div
                      className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full opacity-40"
                      style={{ 
                        backgroundColor: config.color,
                        filter: 'brightness(1.2)'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Objetos dispersos en el área */}
            {objetosEnPantalla.length > 0 ? (
              objetosEnPantalla.map((objeto) => (
                <div
                  key={objeto.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text", JSON.stringify(objeto));
                  }}
                  onClick={() => setObjetoSeleccionado(objeto)}
                  className={`absolute w-24 h-24 md:w-32 md:h-32 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform ${
                    objetoSeleccionado && objetoSeleccionado.id === objeto.id
                      ? "ring-4 ring-yellow-400"
                      : ""
                  }`}
                  style={{
                    left: `${objeto.posX}%`,
                    top: `${objeto.posY}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  title={objeto.nombre}
                >
                  <img
                    src={objeto.imagen}
                    alt={objeto.nombre}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-xl text-white font-bold">
                ⏳ Cargando...
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Game Over Modal */
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ fontFamily: `'Comic Sans MS', 'Comic Sans', cursive, sans-serif` }}>
          <div className="rounded-2xl shadow-2xl p-6 max-w-md w-full border-4" style={{ backgroundColor: '#9DBFA5', borderColor: '#388E3C', fontFamily: `'Comic Sans MS', 'Comic Sans', cursive, sans-serif` }}>
            <div className="text-center">
              <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow">¡GAME OVER!</h2>
              <div className="rounded-xl p-4 mb-6 shadow-inner" style={{ backgroundColor: '#F5F5F4' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Tu Puntuación</p>
                    <p className="text-3xl font-bold text-red-500">{puntajeFinal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Best Score</p>
                    <p className="text-3xl font-bold text-yellow-500">🏆 {mejorPuntuacion}</p>
                  </div>
                </div>
              </div>
              {/* Consejo aleatorio */}
              {consejo && (
                <div className="mx-auto mb-6 p-4 rounded-xl shadow-lg max-w-xs flex flex-col items-center animate-fade-in" style={{ backgroundColor: '#E9D8B4', border: '2px solid #B08968' }}>
                  <span className="font-bold text-lg text-[#7B4F1D] mb-1">Dato curioso</span>
                  <span className="text-base text-gray-800 text-center">{consejo}</span>
                </div>
              )}
              <button
                onClick={reiniciarJuego}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-2xl transition-colors text-base mt-2 shadow"
              >
                Jugar de Nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(100px); }
        }
        @keyframes fall-leaf {
          0% {
            top: -10px;
            opacity: 0;
            transform: translateX(0) rotateZ(0deg);
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            top: 100%;
            opacity: 0;
            transform: translateX(100px) rotateZ(360deg);
          }
        }
        .animate-fall-leaf {
          animation: fall-leaf 3s linear infinite;
        }
      `}</style>

      {/* Crédito de autoría */}
      <div className="text-center text-xs text-gray-600 mt-2">
        Fondo de paisaje: Escena natural con estanque y árboles por{' '}
        <a 
          href="https://www.freepik.es/vector-gratis/escena-natural-estanque-arboles_24467604.htm#fromView=keyword&page=1&position=5&uuid=0e71d363-f52a-466f-9d4b-69670d88d0ed&query=Lago+animada" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-green-700 hover:text-green-800 underline"
        >
          brgfx en Freepik
        </a>
      </div>
    </div>
  );
}