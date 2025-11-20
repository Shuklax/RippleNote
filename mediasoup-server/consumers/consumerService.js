const { assertRouter } = require('../router/routerManager');
const { getTransport } = require('../transports/transportService');

async function createConsumer({
  routerId,
  transportId,
  producerId,
  rtpCapabilities,
  paused = false,
}) {
  const state = assertRouter(routerId);
  const transport = getTransport({ routerId, transportId });

  if (
    !state.router.canConsume({
      producerId,
      rtpCapabilities,
    })
  ) {
    throw new Error('Cannot consume this producer');
  }

  const consumer = await transport.consume({
    producerId,
    rtpCapabilities,
    paused,
  });

  state.consumers.set(consumer.id, consumer);

  consumer.on('transportclose', () => {
    state.consumers.delete(consumer.id);
  });

  return {
    consumer,
    payload: {
      consumer_id: consumer.id,
      producer_id: producerId,
      kind: consumer.kind,
      rtp_parameters: consumer.rtpParameters,
    },
  };
}

module.exports = {
  createConsumer,
};

