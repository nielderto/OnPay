import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { registerENSRecord } from './handlers/registerRecord'
import { syncENSRecord } from './handlers/sync'
import type { Context } from 'hono'

import { type Env } from './env'
import { getCcipReadLisk } from './handlers/getCcipRead'
import { lookupENSRecord } from 'handlers/lookupRecord'
  
const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())
app.get('/health', async (c) => c.json({ status: 'ok' }))
app.post('/v1/:sender/:data', async (c) => {return getCcipReadLisk(c.req, c.env)})

// Registering ENS names
app.post('/api/ens-sync', (c: Context) => registerENSRecord(c.req, c.env))
app.post('/api/ens-register', (c: Context) => registerENSRecord(c.req, c.env))
// Syncing past ENS names
app.post('/api/sync', (c: Context) => syncENSRecord(c))
// Reverse Lookup ENS names
app.get('/api/ens-lookup/:address', lookupENSRecord)

export default app