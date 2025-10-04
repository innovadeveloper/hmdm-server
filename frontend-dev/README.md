# MDM Server - Desarrollo Frontend

Este servidor proxy te permite desarrollar el frontend del MDM Server sin necesidad de compilar el WAR completo.

## Configuración Inicial

### 1. Configura la URL del Backend

Edita `proxy-server.js` y cambia la variable `BACKEND_URL`:

```javascript
const BACKEND_URL = 'http://tu-servidor-backend:8080';
```

Ejemplos:
- Servidor local: `http://localhost:8080`
- Servidor remoto: `http://192.168.1.100:8080`
- Docker: `http://host.docker.internal:8080`

### 2. Inicia el servidor de desarrollo

```bash
npm start
# o
npm run dev
```

El servidor se iniciará en: http://localhost:3000

## Flujo de Desarrollo

1. **Modifica archivos** en `../server/src/main/webapp/`
   - HTML: `app/components/`
   - CSS: `css/main.css`
   - JavaScript: `app/components/` y `app/shared/`

2. **Recarga el navegador** para ver los cambios

3. **Las API calls** se redirigen automáticamente al backend configurado

## Archivos Importantes

- `app/app.js` - Configuración principal de AngularJS
- `app/components/main/controller/` - Controladores principales
- `css/main.css` - Estilos principales
- `index.html` - Página principal

## Ventajas

✅ **Sin compilación**: Ver cambios inmediatamente  
✅ **API funcional**: Proxy automático al backend  
✅ **Watch de archivos**: Notificaciones de cambios  
✅ **Desarrollo rápido**: Ciclo de desarrollo instantáneo  

## Notas

- Asegúrate de que el backend esté ejecutándose
- Los cambios en JavaScript requieren recarga manual del navegador
- Para cambios en librerías, ejecuta el Grunt del proyecto original