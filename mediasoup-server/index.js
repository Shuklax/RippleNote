require('dotenv').config();

const express = require('express');
const cors = require('cors');

const {
  bootstrapWorkers,
  createRouter,
  getRouterState,
  deleteRouter,
} = require('./router/routerManager');
const {
  createTransport,
  connectTransport,
} = require('./transports/transportService');
const { createProducer } = require('./producers/producerService');
const { createConsumer } = require('./consumers/consumerService');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post(
  '/api/router/create',
  asyncHandler(async (req, res) => {
    const router = await createRouter();

    res.json({
      router_id: router.id,
      rtp_capabilities: router.rtpCapabilities,
    });
  }),
);

app.get(
  '/api/router/:routerId/rtp-capabilities',
  asyncHandler(async (req, res) => {
    const state = getRouterState(req.params.routerId);
    if (!state) {
      return res.status(404).json({ error: 'Router not found' });
    }

    return res.json(state.router.rtpCapabilities);
  }),
);

app.post(
  '/api/transport/create',
  asyncHandler(async (req, res) => {
    const { router_id: routerId } = req.body;
    if (!routerId) {
      return res.status(400).json({ error: 'router_id is required' });
    }

    const { payload } = await createTransport({ routerId });
    return res.json(payload);
  }),
);

app.post(
  '/api/transport/connect',
  asyncHandler(async (req, res) => {
    const { router_id: routerId, transport_id: transportId, dtls_parameters: dtlsParameters } = req.body;
    if (!routerId || !transportId || !dtlsParameters) {
      return res.status(400).json({ error: 'router_id, transport_id and dtls_parameters are required' });
    }

    const response = await connectTransport({ routerId, transportId, dtlsParameters });
    return res.json(response);
  }),
);

app.post(
  '/api/producer/create',
  asyncHandler(async (req, res) => {
    const { router_id: routerId, transport_id: transportId, rtp_parameters: rtpParameters, app_data: appData } = req.body;
    if (!routerId || !transportId || !rtpParameters) {
      return res
        .status(400)
        .json({ error: 'router_id, transport_id and rtp_parameters are required' });
    }

    const { payload } = await createProducer({ routerId, transportId, rtpParameters, appData });
    return res.json(payload);
  }),
);

app.post(
  '/api/consumer/create',
  asyncHandler(async (req, res) => {
    const {
      router_id: routerId,
      transport_id: transportId,
      producer_id: producerId,
      rtp_capabilities: rtpCapabilities,
      paused,
    } = req.body;

    if (!routerId || !transportId || !producerId || !rtpCapabilities) {
      return res
        .status(400)
        .json({ error: 'router_id, transport_id, producer_id and rtp_capabilities are required' });
    }

    const { payload } = await createConsumer({
      routerId,
      transportId,
      producerId,
      rtpCapabilities,
      paused,
    });

    return res.json(payload);
  }),
);

app.post(
  '/api/router/:routerId/close',
  asyncHandler(async (req, res) => {
    const { routerId } = req.params;
    deleteRouter(routerId);
    return res.json({ status: 'closed' });
  }),
);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: err.message || 'Internal server error',
  });
});

async function start() {
  await bootstrapWorkers();
  const port = Number(process.env.HTTP_PORT || process.env.PORT || 3000);
  app.listen(port, () => {
    console.log(`Mediasoup server listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start mediasoup server', err);
  process.exit(1);
});

