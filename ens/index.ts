import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { type Env } from './env'
import { getCcipReadLisk } from './handlers/getCcipRead'
import { syncENSRecord } from './handlers/sync'
import { registerENSRecord } from 'handlers/registerRecord'
import { lookupENSRecord } from 'handlers/lookupRecord'
  
const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())
app.get('/health', async (c) => c.json({ status: 'ok' }))
app.get('/v1/:sender/:data', async (c) => {return getCcipReadLisk(c.req, c.env)})
app.post('/v1/:sender/:data', async (c) => {return getCcipReadLisk(c.req, c.env)})

app.post('/api/ens-sync', (c) => registerENSRecord(c.req, c.env))
app.post('/api/sync', syncENSRecord)
app.get('/api/ens-lookup/:address', lookupENSRecord)

export default app