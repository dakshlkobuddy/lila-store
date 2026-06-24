// Shared CORS headers for all Supabase Edge Functions in this project.
// Allows the Vite dev server (localhost:5173) and any deployed frontend origin
// to call these functions from the browser.

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Returns a 200 OK preflight response if the request is an OPTIONS request,
 * otherwise returns null so the caller continues processing.
 */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

/**
 * Convenience: wrap a JSON payload with CORS headers.
 */
export function jsonResponse(
  payload: unknown,
  status = 200
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
