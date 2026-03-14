import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Browser / client-side Supabase client (uses anon key).
 * Safe to import in Client Components.
 */
export const supabaseBrowser = createClient(url, anonKey);

/**
 * Server-side Supabase client (uses service role key).
 * Only import this inside API routes or Server Components.
 * Service role bypasses RLS — never expose to the browser.
 */
export const supabaseServer = createClient(url, serviceKey ?? anonKey, {
  auth: { persistSession: false },
});

/** Bucket used for completion proof images */
export const COMPLETION_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "completion-images";

/** Bucket used for road damage images captured by the model */
export const IMAGE_BUCKET = "Images";

/**
 * Converts a storage path or existing full URL to a public URL.
 * If the value already starts with "http" it is returned as-is.
 */
export function getImageUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  const { data } = supabaseBrowser.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(pathOrUrl);
  return data.publicUrl;
}
