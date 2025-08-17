const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  
  if (req.url === '/health' && req.method === 'GET') {
    res.end(JSON.stringify({
      success: true,
      message: 'Simple server is running',
      timestamp: new Date().toISOString()
    }));
  } else if (req.url === '/api/auth/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        console.log('Registration attempt:', userData);
        
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            user: {
              id: Date.now().toString(),
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              role: userData.role || 'customer'
            },
            token: 'test-token-' + Date.now()
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: { message: 'Invalid JSON data' }
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      error: { message: 'Endpoint not found' }
    }));
  }
});

const PORT = 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Registration: POST http://localhost:${PORT}/api/auth/register`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});



