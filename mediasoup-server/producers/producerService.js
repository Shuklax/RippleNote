const { assertRouter } = require('../router/routerManager');
const { getTransport } = require('../transports/transportService');

async function createProducer({ routerId, transportId, rtpParameters, appData }) {
  const state = assertRouter(routerId);
  const transport = getTransport({ routerId, transportId });

  const producer = await transport.produce({ rtpParameters, appData });
  state.producers.set(producer.id, producer);

  producer.on('transportclose', () => {
    state.producers.delete(producer.id);
  });

  return {
    producer,
    payload: {
      producer_id: producer.id,
      kind: producer.kind,
    },
  };
}

module.exports = {
  createProducer,
};

