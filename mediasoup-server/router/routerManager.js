const mediasoup = require('mediasoup');
const os = require('os');

const workers = [];
const routerStore = new Map();
let nextWorkerIndex = 0;
let workersReady = false;

const defaultCodecs = [
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
];

async function bootstrapWorkers(options = {}) {
  if (workersReady) {
    return workers;
  }

  const {
    logLevel = process.env.MEDIASOUP_LOG_LEVEL || 'warn',
    logTags = (process.env.MEDIASOUP_LOG_TAGS || 'info,ice,dtls,rtp,srtp,rtcp')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    rtcMinPort = Number(process.env.MEDIASOUP_RTC_MIN_PORT) || 40000,
    rtcMaxPort = Number(process.env.MEDIASOUP_RTC_MAX_PORT) || 49999,
    numWorkers = Number(process.env.MEDIASOUP_WORKERS)
      || Math.min(os.cpus().length, 4),
  } = options;

  for (let i = 0; i < numWorkers; i += 1) {
    const worker = await mediasoup.createWorker({
      logLevel,
      logTags,
      rtcMinPort,
      rtcMaxPort,
    });

    worker.on('died', () => {
      console.error('Mediasoup worker died, exiting in 2 seconds...');
      setTimeout(() => process.exit(1), 2000);
    });

    workers.push(worker);
  }

  workersReady = true;
  console.log(`Initialized ${workers.length} mediasoup worker(s)`);
  return workers;
}

function getNextWorker() {
  if (!workers.length) {
    throw new Error('Mediasoup workers are not initialized');
  }

  const worker = workers[nextWorkerIndex % workers.length];
  nextWorkerIndex += 1;
  return worker;
}

async function createRouter(mediaCodecs = defaultCodecs) {
  const worker = getNextWorker();
  const router = await worker.createRouter({ mediaCodecs });

  routerStore.set(router.id, {
    router,
    transports: new Map(),
    producers: new Map(),
    consumers: new Map(),
  });

  return router;
}

function getRouterState(routerId) {
  return routerStore.get(routerId);
}

function assertRouter(routerId) {
  const state = getRouterState(routerId);
  if (!state) {
    throw new Error('Router not found');
  }
  return state;
}

function deleteRouter(routerId) {
  const state = routerStore.get(routerId);
  if (!state) {
    return;
  }

  state.consumers.forEach((consumer) => consumer.close());
  state.producers.forEach((producer) => producer.close());
  state.transports.forEach((transport) => transport.close());
  state.router.close();

  routerStore.delete(routerId);
}

module.exports = {
  bootstrapWorkers,
  createRouter,
  getRouterState,
  assertRouter,
  deleteRouter,
  defaultCodecs,
};

