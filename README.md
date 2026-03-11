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

### Funcionamiento K-Means
Obtención de datos

Consulta la base de datos para obtener reportes recientes con ubicación válida dentro de un rango de días.

Procesamiento de ubicaciones

Convierte la ubicación almacenada como "lat, lng" en coordenadas numéricas.

Cálculo de peso del reporte

Cada reporte recibe un peso heurístico según:

tipo de problema (fuga, electricidad, basura, etc.)

estado del reporte

qué tan reciente es

Aplicación del algoritmo K-Means

Agrupa los reportes en k clusters geográficos según cercanía entre coordenadas.

Recalculo de centroides

Los centroides de cada cluster se recalculan varias veces considerando el peso de los reportes.

Generación de estadísticas

Para cada cluster se calculan:

tipo de problema dominante

estado dominante

radio aproximado de influencia

cantidad de reportes

Respuesta al cliente

Devuelve los clusters ordenados por importancia o peso total, para generar el heatmap en el mapa.