### Barra de navegacion 
*Permitir al usuario navegar entre las diferentes secciones de la plataforma  utilizando rutas internas controladas por el estado de la aplicación.

*Se emplea map() para iterar sobre los navLinks y renderiza a una vista por el apartado prsionado, se ejecuta onNavigate(link.view), para que muestre la pestaña sin recargar la pagina

### /* Botones login/usuario */
* Si el usuario esta autenticado (user: existe) Muestra un saludo con nombre e icono de usuario
* Muestra boton para cerrar sesion 
* Si el usuario no esta autenticado muestra boton para registrarse o iniciar sesion
-EVENTOS: onLoginClick, onRegisterClick, onLogout

### useEffect Principal
* Si hay un usuario guardado en localStorage, lo carga y lo pone en el estado global (user).

*Datos públicos:
Hace peticiones a la API para obtener:
1.- Novedades/noticias (/novedades)
2.- Eventos (/eventos)
3.- Calendario (/calendario)
4.- Mapa
Los resultados se guardan en los estados correspondientes para que estén disponibles en toda la app.

### Ajuste de mapa
* Garantizar que el mapa se muestre correctamente ajustado y centrado cada vez que el usuario navega a la pestaña "Mapa", evitando errores visuales o mapas cortados.

### handleLoginSuccess
* Garantizar que, tras un login exitoso, la sesión del usuario quede activa y persistente, y la interfaz se actualice para reflejar el nuevo estado autenticado.

### Funcion renderView

* Centralizar la lógica de navegación y renderizado de vistas, asegurando que solo se muestre la sección adecuada según el estado de la app y los permisos del usuario.