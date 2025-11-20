/**
 * Example Mediasoup Server (Node.js)
 * 
 * This is a reference implementation of a Mediasoup server that your Python backend
 * can communicate with via HTTP API.
 * 
 * To use this:
 * 1. Install: npm install mediasoup express cors
 * 2. Run: node mediasoup_server_example.js
 * 3. The server will run on port 3000
 */

const mediasoup = require('mediasoup');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const workers = [];
const routers = new Map();

// Initialize mediasoup workers
async function createWorkers() {
  const { numWorkers } = mediasoup.types;
  const numCpus = require('os').cpus().length;
  
  for (let i = 0; i < Math.min(numCpus, 4); i++) {
    const worker = await mediasoup.createWorker({
      logLevel: 'warn',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
    });
    
    worker.on('died', () => {
      console.error('Mediasoup worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });
    
    workers.push(worker);
  }
  
  console.log(`Created ${workers.length} mediasoup workers`);
}

// Get next available worker
function getNextWorker() {
  return workers[Math.floor(Math.random() * workers.length)];
}

// Create router
app.post('/api/router/create', async (req, res) => {
  try {
    const worker = getNextWorker();
    const router = await worker.createRouter({
      mediaCodecs: [
        {
          kind: 'audio',
          mimeType: 'audio/opus',
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: 'video',
          mimeType: 'video/VP8',
          clockRate: 90000,
        },
        {
          kind: 'video',
          mimeType: 'video/VP9',
          clockRate: 90000,
        },
        {
          kind: 'video',
          mimeType: 'video/H264',
          clockRate: 90000,
          parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
          },
        },
      ],
    });
    
    routers.set(router.id, router);
    
    res.json({
      router_id: router.id,
      rtp_capabilities: router.rtpCapabilities,
    });
  } catch (error) {
    console.error('Error creating router:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get router RTP capabilities
app.get('/api/router/:routerId/rtp-capabilities', async (req, res) => {
  try {
    const router = routers.get(req.params.routerId);
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    res.json(router.rtpCapabilities);
  } catch (error) {
    console.error('Error getting RTP capabilities:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create transport
app.post('/api/transport/create', async (req, res) => {
  try {
    const { router_id, direction } = req.body;
    const router = routers.get(router_id);
    
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
    
    res.json({
      transport_id: transport.id,
      ice_parameters: transport.iceParameters,
      ice_candidates: transport.iceCandidates,
      dtls_parameters: transport.dtlsParameters,
    });
  } catch (error) {
    console.error('Error creating transport:', error);
    res.status(500).json({ error: error.message });
  }
});

// Connect transport
app.post('/api/transport/connect', async (req, res) => {
  try {
    const { router_id, transport_id, dtls_parameters } = req.body;
    const router = routers.get(router_id);
    
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    const transport = router.transports.get(transport_id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }
    
    await transport.connect({ dtlsParameters: dtls_parameters });
    
    res.json({ status: 'connected' });
  } catch (error) {
    console.error('Error connecting transport:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create producer
app.post('/api/producer/create', async (req, res) => {
  try {
    const { router_id, transport_id, rtp_parameters } = req.body;
    const router = routers.get(router_id);
    
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    const transport = router.transports.get(transport_id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }
    
    const producer = await transport.produce({ rtpParameters: rtp_parameters });
    
    res.json({
      producer_id: producer.id,
      kind: producer.kind,
    });
  } catch (error) {
    console.error('Error creating producer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create consumer
app.post('/api/consumer/create', async (req, res) => {
  try {
    const { router_id, transport_id, producer_id, rtp_capabilities } = req.body;
    const router = routers.get(router_id);
    
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    const transport = router.transports.get(transport_id);
    if (!transport) {
      return res.status(404).json({ error: 'Transport not found' });
    }
    
    if (!router.canConsume({ producerId: producer_id, rtpCapabilities: rtp_capabilities })) {
      return res.status(400).json({ error: 'Cannot consume this producer' });
    }
    
    const consumer = await transport.consume({
      producerId: producer_id,
      rtpCapabilities: rtp_capabilities,
      paused: false,
    });
    
    res.json({
      consumer_id: consumer.id,
      producer_id: producer_id,
      kind: consumer.kind,
      rtp_parameters: consumer.rtpParameters,
    });
  } catch (error) {
    console.error('Error creating consumer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Close router
app.post('/api/router/:routerId/close', async (req, res) => {
  try {
    const router = routers.get(req.params.routerId);
    if (!router) {
      return res.status(404).json({ error: 'Router not found' });
    }
    
    router.close();
    routers.delete(req.params.routerId);
    
    res.json({ status: 'closed' });
  } catch (error) {
    console.error('Error closing router:', error);
    res.status(500).json({ error: error.message });
  }
});

// Initialize and start server
async function start() {
  await createWorkers();
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Mediasoup server running on port ${PORT}`);
  });
}

start().catch(console.error);


