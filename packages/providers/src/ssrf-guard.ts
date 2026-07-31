import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function isPrivateIPv4(ip: string): boolean {
  const int = ipv4ToInt(ip);
  const inRange = (base: string, maskBits: number) => {
    const baseInt = ipv4ToInt(base);
    const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0;
    return (int & mask) === (baseInt & mask);
  };
  return (
    inRange("10.0.0.0", 8) || // RFC1918
    inRange("172.16.0.0", 12) ||
    inRange("192.168.0.0", 16) ||
    inRange("127.0.0.0", 8) || // loopback
    inRange("169.254.0.0", 16) || // link-local, includes 169.254.169.254 cloud metadata
    inRange("0.0.0.0", 8) ||
    inRange("100.64.0.0", 10) // carrier-grade NAT
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" || // loopback
    normalized.startsWith("fc") || // unique local (fc00::/7)
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") || // link-local
    normalized === "::" ||
    normalized.startsWith("::ffff:127.") // IPv4-mapped loopback
  );
}

export class UnsafeUrlError extends Error {}

/**
 * Blocks the classic SSRF targets: private/loopback/link-local ranges and cloud
 * metadata endpoints (brief §23). Resolves the hostname via DNS and checks the
 * resolved IP, not just the hostname string, so DNS-rebinding-style bypasses that
 * resolve a public-looking hostname to a private IP are still caught.
 */
export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeUrlError("Not a valid URL.");
  }

  if (url.protocol !== "https:") {
    throw new UnsafeUrlError("Only HTTPS URLs are allowed.");
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new UnsafeUrlError("This host is not allowed.");
  }

  if (isIP(hostname)) {
    if (isIP(hostname) === 4 ? isPrivateIPv4(hostname) : isPrivateIPv6(hostname)) {
      throw new UnsafeUrlError("This host resolves to a private address.");
    }
    return url;
  }

  const results = await lookup(hostname, { all: true });
  for (const { address, family } of results) {
    if (family === 4 && isPrivateIPv4(address)) {
      throw new UnsafeUrlError("This host resolves to a private address.");
    }
    if (family === 6 && isPrivateIPv6(address)) {
      throw new UnsafeUrlError("This host resolves to a private address.");
    }
  }

  return url;
}

const MAX_REDIRECTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const MAX_BYTES = 2_000_000;

export interface SafeFetchResult {
  finalUrl: string;
  status: number;
  contentType: string | null;
  body: string;
}

/**
 * Fetches an untrusted, subscriber-supplied URL under the guardrails brief §23
 * requires: HTTPS only, blocks private/internal addresses (checked on every hop, not
 * just the initial URL), caps redirects, enforces a timeout and a byte-size limit.
 */
export async function safeFetch(rawUrl: string): Promise<SafeFetchResult> {
  let currentUrl = (await assertSafeUrl(rawUrl)).toString();

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "RuachResourceBot/0.1 (+https://ruach.example/bot)" },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new UnsafeUrlError("Redirect with no Location header.");
      }
      if (redirectCount === MAX_REDIRECTS) {
        throw new UnsafeUrlError("Too many redirects.");
      }
      currentUrl = (await assertSafeUrl(new URL(location, currentUrl).toString())).toString();
      continue;
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BYTES) {
      throw new UnsafeUrlError("Response too large.");
    }

    const reader = response.body?.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];
    if (reader) {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > MAX_BYTES) {
          await reader.cancel();
          throw new UnsafeUrlError("Response too large.");
        }
        chunks.push(value);
      }
    }
    const body = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8");

    return {
      finalUrl: currentUrl,
      status: response.status,
      contentType: response.headers.get("content-type"),
      body,
    };
  }

  throw new UnsafeUrlError("Too many redirects.");
}
