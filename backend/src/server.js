
import fastify from 'fastify';

import refineRoutes from './routes/refine.js';
import apiKeysRoutes from './routes/api-keys.routes.js';

const server = fastify({ logger: true });

server.register(refineRoutes);
server.register(apiKeysRoutes);

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export { server };
