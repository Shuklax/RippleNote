const { assertRouter } = require('../router/routerManager');

async function createTransport({
  routerId,
  listenIps = [{ ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0', announcedIp: process.env.MEDIASOUP_ANNOUNCED_IP || null }],
  enableUdp = true,
  enableTcp = true,
  preferUdp = true,
}) {
  const state = assertRouter(routerId);

  const transport = await state.router.createWebRtcTransport({
    listenIps,
    enableUdp,
    enableTcp,
    preferUdp,
  });

  state.transports.set(transport.id, transport);

  return {
    transport,
    payload: {
      transport_id: transport.id,
      ice_parameters: transport.iceParameters,
      ice_candidates: transport.iceCandidates,
      dtls_parameters: transport.dtlsParameters,
    },
  };
}

async function connectTransport({ routerId, transportId, dtlsParameters }) {
  const state = assertRouter(routerId);
  const transport = state.transports.get(transportId);

  if (!transport) {
    throw new Error('Transport not found');
  }

  await transport.connect({ dtlsParameters });
  return { status: 'connected' };
}

function getTransport({ routerId, transportId }) {
  const state = assertRouter(routerId);
  const transport = state.transports.get(transportId);
  if (!transport) {
    throw new Error('Transport not found');
  }
  return transport;
}

module.exports = {
  createTransport,
  connectTransport,
  getTransport,
};

