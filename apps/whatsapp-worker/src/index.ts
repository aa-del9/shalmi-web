import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

app.get('/health', (c) =>
  c.json({ ok: true, service: 'whatsapp-worker' }),
);

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`whatsapp-worker listening on :${info.port}`);
});
