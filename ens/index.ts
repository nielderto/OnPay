import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { HonoRequest } from 'hono'

import { type Env } from './env'
import { getCcipReadLisk } from './handlers/getCcipRead'

// L1 Resolver address that MetaMask is using
const L1_RESOLVER_ADDRESS = "0x28d1a3eB328cb855887106A01d227357E26fF859";

const app = new Hono<{ Bindings: Env }>()

// Configure CORS
app.use('*', cors())

// Add debug logging for all requests
app.use('*', async (c, next) => {
    console.log(`Request: ${c.req.method} ${c.req.url}`)

    // Log headers for debugging
    const headers: Record<string, string> = {}
    for (const [key, value] of c.req.raw.headers.entries()) {
        headers[key] = value
    }
    console.log('Headers:', headers)

    // Try to log body if it's POST
    if (c.req.method === 'POST') {
        try {
            const bodyText = await c.req.text()
            console.log('Body:', bodyText)

            // Since we've consumed the body, create a new Request for downstream handlers
            c.req.raw = new Request(c.req.url, {
                method: c.req.method,
                headers: c.req.raw.headers,
                body: bodyText
            })
        } catch (e) {
            console.log('Could not read body:', e)
        }
    }

    return next()
})

// Health check endpoint
app.get('/health', async (c) => c.json({ status: 'ok' }))

// Direct CCIP-Read handler - use the existing implementation
app.get('/:sender/:calldata', async (c) => {
    try {
        console.log(`CCIP-Read direct call: sender=${c.req.param('sender')}, calldata=${c.req.param('calldata')}`);
        return await getCcipReadLisk(c.req, c.env);
    } catch (error) {
        console.error('Error in CCIP-Read handler:', error);
        // Always return a valid response to prevent MetaMask from breaking
        return c.json({
            data: "0x0000000000000000000000000000000000000000000000000000000000000000"
        });
    }
});

// v1 path format
app.get('/v1/:sender/:calldata', async (c) => {
    try {
        console.log(`CCIP-Read v1 call: sender=${c.req.param('sender')}, calldata=${c.req.param('calldata')}`);
        return await getCcipReadLisk(c.req, c.env);
    } catch (error) {
        console.error('Error in CCIP-Read v1 handler:', error);
        // Always return a valid response to prevent MetaMask from breaking
        return c.json({
            data: "0x0000000000000000000000000000000000000000000000000000000000000000"
        });
    }
});

// Add specific handler for the placeholder URL that MetaMask is trying
app.get('/v1/{sender}/{data}', (c) => {
    console.log('Detected placeholder URL format being used directly');

    // Return a valid hex string directly
    return new Response(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        }
    );
});

// Also handle literal placeholder pattern
app.get('/{sender}/{data}', (c) => {
    console.log('Detected placeholder URL format at root path');

    // Return a valid hex string directly
    return new Response(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        }
    );
});

// Handle direct requests to /v1/ endpoint
app.all('/v1/', async (c) => {
    console.log('Received request to /v1/ endpoint');

    try {
        // Check if this is a POST request with data
        if (c.req.method === 'POST') {
            console.log('Processing POST request to /v1/');

            // Get the request body
            let body;
            try {
                body = await c.req.json();
                console.log('Request body:', body);
            } catch (e) {
                console.log('Could not parse JSON body, trying text');
                const textBody = await c.req.text();
                console.log('Text body:', textBody);
                // Try to handle raw text/calldata directly
                if (textBody.startsWith('0x')) {
                    // Call the handler directly with the calldata
                    return await getCcipReadLisk({
                        param: () => null,
                        url: c.req.url
                    } as any, c.env);
                }
            }

            // If we have a valid body with data field, process it
            if (body && body.data) {
                console.log('Found data in request body:', body.data);
                // Call the handler directly with the calldata
                return await getCcipReadLisk({
                    param: (name: string) => name === 'calldata' ? body.data : null,
                    url: c.req.url
                } as any, c.env);
            }
        }

        // For any other type of request, return default zero address
        console.log('Returning default zero address for /v1/ request');
        return new Response(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );
    } catch (error) {
        console.error('Error handling /v1/ request:', error);
        return new Response(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );
    }
});

// Provide debug info endpoint
app.get('/debug-info', (c) => {
    return c.json({
        message: "ENS Gateway Service for Lisk",
        l1Resolver: L1_RESOLVER_ADDRESS,
        endpoints: {
            ccipRead: "/:sender/:calldata",
            ccipReadV1: "/v1/:sender/:calldata",
            health: "/health",
            debugInfo: "/debug-info"
        }
    })
})

// Simple POST endpoint handler for JSON-RPC requests
app.post('*', async (c) => {
    try {
        console.log('Processing general POST request to:', c.req.url);

        // Parse the URL to check the path
        const url = new URL(c.req.url);
        const path = url.pathname;

        // For CCIP-Read requests, we need special handling
        if (path === '/v1/' || path === '/') {
            console.log('Processing CCIP-Read POST request');

            let data;
            try {
                // Try to get body as JSON
                const body = await c.req.json();
                console.log('POST request body:', body);

                // Check for data field in body
                if (body.data) {
                    data = body.data;
                } else if (body.transaction && body.transaction.data) {
                    data = body.transaction.data;
                }
            } catch (e) {
                console.log('Failed to parse JSON body, trying text');
                // Try as raw text
                const textBody = await c.req.text();
                if (textBody.startsWith('0x')) {
                    data = textBody;
                }
                console.log('Text body:', textBody);
            }

            // If we found calldata, process it
            if (data) {
                console.log('Found calldata in POST request:', data);
                // Call the handler directly with the calldata
                return await getCcipReadLisk({
                    param: (name: string) => name === 'calldata' ? data : null,
                    url: c.req.url
                } as any, c.env);
            }
        }

        // Default response for other POST requests
        console.log('Returning default response for POST request');
        return new Response(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            }
        );
    }
});

// Add detailed debugging endpoint
app.get('/debug', async (c) => {
    try {
        // Collecting debug information
        const url = new URL(c.req.url);
        const headers: Record<string, string> = {};
        for (const [key, value] of c.req.raw.headers.entries()) {
            headers[key] = value;
        }

        return c.json({
            message: "ENS Gateway Debug Information",
            version: "1.0.1",
            timestamp: new Date().toISOString(),
            request: {
                url: c.req.url,
                method: c.req.method,
                pathname: url.pathname,
                search: url.search,
                headers: headers
            },
            l1Resolver: L1_RESOLVER_ADDRESS,
            endpoints: {
                ccipRead: "/:sender/:calldata",
                ccipReadV1: "/v1/:sender/:calldata",
                placeholderPatterns: [
                    "/v1/{sender}/{data}",
                    "/{sender}/{data}"
                ],
                health: "/health",
                debug: "/debug"
            },
            metamaskCompatibility: {
                responseFormat: {
                    example: {
                        data: "0x0000000000000000000000000000000000000000000000000000000000000000"
                    },
                    note: "Response must be a JSON object with a 'data' field containing a 0x-prefixed 64-character hex string"
                },
                recommendedGatewayUrl: "https://ens-gateway.onpaylisk.workers.dev/v1/",
                possibleUrlFormats: [
                    "https://ens-gateway.onpaylisk.workers.dev/v1/",
                    "https://ens-gateway.onpaylisk.workers.dev/",
                    "https://gateway.durin.dev/v1/"
                ]
            },
            troubleshooting: {
                metamaskBufferOverrun: "If MetaMask shows 'buffer overrun' errors, ensure the response format is correct and gateway URL is set properly",
                contractUpdate: "Use updateGatewayUrl.ts script to update your L1Resolver contract's gateway URL",
                clearCache: "Try clearing MetaMask's cache in Settings > Advanced > Clear activity and nonce data"
            }
        })
    } catch (error: unknown) {
        console.error('Error in debug endpoint:', error);
        return c.json({
            error: "Failed to generate debug information",
            message: error instanceof Error ? error.message : String(error)
        }, 500);
    }
});

// Fallback for all other requests
app.all('*', (c) => {
    console.log('Fallback handler - returning zero address');
    return new Response(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        }
    );
});

export default app