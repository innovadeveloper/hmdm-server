const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3000;

// Middleware de logging para todas las requests
app.use((req, res, next) => {
  console.log(`🌐 Request: ${req.method} ${req.url}`);
  next();
});

// Ruta al directorio webapp del proyecto
const WEBAPP_DIR = path.join(__dirname, '..', 'server', 'src', 'main', 'webapp');

console.log('Sirviendo archivos desde:', WEBAPP_DIR);

// Configuración del proxy para las API calls
// IMPORTANTE: Cambia esta URL por la de tu servidor backend real
// const BACKEND_URL = 'http://localhost:8080'; // Cambia por tu URL de backend
// const BACKEND_URL = 'https://192.168.0.110'; // Cambia por tu URL de backend
const BACKEND_URL = 'https://mdm.abexa.pe'; // Cambia por tu URL de backend
// https://192.168.0.110/rest/public/auth/login

// Endpoint de prueba simple para el proxy
app.get('/test-proxy', (req, res) => {
  console.log('🧪 Test proxy endpoint llamado');
  res.json({ 
    message: 'Proxy server funcionando', 
    timestamp: new Date().toISOString(),
    backend: BACKEND_URL 
  });
});

// Endpoint de prueba para verificar conectividad con el backend
app.get('/test-backend', (req, res) => {
  const https = require('https');
  const url = require('url');
  
  const testUrl = BACKEND_URL + '/rest/public/auth/login';
  console.log('🧪 Probando conectividad con:', testUrl);
  
  const parsedUrl = url.parse(testUrl);
  const postData = JSON.stringify({"login":"test","password":"test"});
  
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': BACKEND_URL,
      'Referer': BACKEND_URL + '/'
    },
    rejectUnauthorized: false // Para certificados autofirmados
  };

  const reqTest = https.request(options, (resTest) => {
    console.log('🧪 Respuesta del backend:', resTest.statusCode, resTest.statusMessage);
    
    let data = '';
    resTest.on('data', (chunk) => {
      data += chunk;
    });
    
    resTest.on('end', () => {
      res.json({
        status: resTest.statusCode,
        statusMessage: resTest.statusMessage,
        url: testUrl,
        headers: resTest.headers,
        data: data.substring(0, 200) // Primeros 200 caracteres de la respuesta
      });
    });
  });

  reqTest.on('error', (error) => {
    console.error('❌ Error al probar backend:', error.message);
    res.status(500).json({ error: error.message });
  });

  reqTest.write(postData);
  reqTest.end();
});

// Endpoint para obtener cookies iniciales del backend
app.get('/init-cookies', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/init-cookies': '/' // Redirigir a la raíz del backend
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('🍪 Obteniendo cookies iniciales del backend');
    console.log('🍪 Set-Cookie recibidas:', proxyRes.headers['set-cookie'] || 'No cookies');
  }
}));

// Proxy MANUAL para todas las llamadas REST API
app.use('/rest', (req, res) => {
  const fullPath = '/rest' + req.url; // Reconstituir la ruta completa
  console.log('🔄 PROXY MANUAL EJECUTADO:', req.method, fullPath, '-> ', BACKEND_URL + fullPath);
  
  const https = require('https');
  const url = require('url');
  
  const targetUrl = BACKEND_URL + fullPath;
  const parsedUrl = url.parse(targetUrl);
  
  // Preparar headers
  const headers = {
    ...req.headers,
    'host': parsedUrl.hostname,
    'origin': BACKEND_URL,
    'referer': BACKEND_URL + '/'
  };
  
  // Opciones para la request al backend
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.path,
    method: req.method,
    headers: headers,
    rejectUnauthorized: false
  };

  // Crear proxy request
  const proxyReq = https.request(options, (proxyRes) => {
    console.log('📥 PROXY RESPONSE:', proxyRes.statusCode, fullPath);
    
    // Copiar headers de respuesta
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('❌ PROXY ERROR:', err.message);
    res.status(500).json({ error: 'Proxy Error: ' + err.message });
  });

  // Pipe request body al backend
  req.pipe(proxyReq);
});

// Proxy para otros endpoints que pueda necesitar el MDM
app.use('/api', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  secure: false, // Para HTTPS con certificados autofirmados
  logLevel: 'info'
}));

// Middleware para servir archivos estáticos (DESPUÉS de los proxies)
app.use(express.static(WEBAPP_DIR));

// Fallback para rutas de AngularJS (SPA) - manejar todas las rutas no encontradas
app.get('*', (req, res) => {
  res.sendFile(path.join(WEBAPP_DIR, 'index.html'));
});

// Watch para cambios en archivos y mostrar en consola
const watcher = chokidar.watch(WEBAPP_DIR, {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (filePath) => {
  console.log(`📝 Archivo modificado: ${path.relative(WEBAPP_DIR, filePath)}`);
  console.log(`🔄 Recarga tu navegador para ver los cambios`);
});

app.listen(PORT, () => {
  console.log('\n🚀 Servidor de desarrollo iniciado!');
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 Backend proxy: ${BACKEND_URL}`);
  console.log(`📁 Archivos desde: ${WEBAPP_DIR}`);
  console.log('\n📝 Instrucciones:');
  console.log('1. Modifica archivos en server/src/main/webapp/');
  console.log('2. Los cambios se verán inmediatamente al recargar el navegador');
  console.log('3. Las API calls se redirigirán automáticamente al backend');
  console.log('\n⚠️  IMPORTANTE: Cambia BACKEND_URL en proxy-server.js por tu servidor real\n');
});