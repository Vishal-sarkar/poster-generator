export interface Env {
  MY_BUCKET: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Helper CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Serve uploaded files (GET /file/<key>)
    if (request.method === 'GET' && url.pathname.startsWith('/file/')) {
      const key = url.pathname.substring('/file/'.length);
      if (!key) {
        return new Response('File key is missing', { status: 400, headers: corsHeaders });
      }

      try {
        const object = await env.MY_BUCKET.get(key);
        if (!object) {
          return new Response('File not found', { status: 404, headers: corsHeaders });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Ensure CORS is set
        for (const [k, v] of Object.entries(corsHeaders)) {
          headers.set(k, v);
        }

        return new Response(object.body, { headers });
      } catch (err: any) {
        return new Response(`Error fetching file: ${err.message}`, { status: 500, headers: corsHeaders });
      }
    }

    // 2. Upload files (POST /upload)
    if (request.method === 'POST' && url.pathname === '/upload') {
      try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
          return new Response(JSON.stringify({ error: 'No file uploaded' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const type = url.searchParams.get('type') || 'certificates';
        const key = `${type}/${crypto.randomUUID()}.png`;

        await env.MY_BUCKET.put(key, file.stream(), {
          httpMetadata: {
            contentType: 'image/png',
          },
        });

        const fileUrl = `${url.origin}/file/${key}`;

        return new Response(
          JSON.stringify({
            success: true,
            key,
            url: fileUrl,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};
