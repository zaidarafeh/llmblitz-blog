export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request, locals }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (provider !== 'github') {
    return new Response('Unsupported provider', { status: 400 });
  }

  const env = (locals as any).runtime?.env ?? process.env;
  const clientId = env.GITHUB_CLIENT_ID;

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
  });

  return Response.redirect(
    `https://github.com/login/oauth/authorize?${params}`,
    302
  );
};
