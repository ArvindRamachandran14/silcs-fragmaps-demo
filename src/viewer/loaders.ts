import { resolveRuntimeUrl } from "@/data/manifest";

export async function assetExists(assetPath: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  const targetUrl = resolveRuntimeUrl(assetPath);

  try {
    const headResponse = await fetcher(targetUrl, { method: "HEAD" });
    if (headResponse.ok) {
      return true;
    }
  } catch (_error) {
    // Some static hosts do not support HEAD consistently; GET fallback below handles this.
  }

  try {
    const getResponse = await fetcher(targetUrl, { method: "GET" });
    return getResponse.ok;
  } catch (_error) {
    return false;
  }
}
