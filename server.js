const dgram = require('dgram');
const WebSocket = require('ws');

const UDP_PORT = 5000; // El puerto donde envías tus datos del modelo
const WS_PORT = 8080;  // El puerto para la página web

// Configurar el servidor WebSocket
const wss = new WebSocket.Server({ port: WS_PORT });
console.log(`Servidor WebSocket escuchando en ws://localhost:${WS_PORT}`);

// Configurar el servidor UDP
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    // Cuando llega un mensaje UDP, se retransmite a todos los clientes web conectados
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(msg.toString());
        }
    });
});

udpServer.bind(UDP_PORT, () => {
    console.log(`Servidor UDP escuchando en el puerto ${UDP_PORT}`);
});
