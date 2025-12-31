/**
 * Content Moderation Helpers
 * - IP blocking
 * - Forbidden word filtering
 * - Rate limiting
 */

import type { Organization } from '../../types/forum';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if an IP is blocked for a service
 */
export function checkIPBlocked(
  userIp: string,
  blockedIPs: string[] | undefined
): ModerationResult {
  if (!blockedIPs || blockedIPs.length === 0) {
    return { allowed: true };
  }

  // Normalize the user IP
  const normalizedUserIp = userIp.trim().toLowerCase();

  for (const blockedIP of blockedIPs) {
    const normalizedBlockedIP = blockedIP.trim().toLowerCase();

    // Skip empty entries
    if (!normalizedBlockedIP) continue;

    // Exact match
    if (normalizedUserIp === normalizedBlockedIP) {
      return { allowed: false, reason: 'Your IP address has been blocked' };
    }

    // Wildcard/prefix match (e.g., "192.168.*" or "192.168.")
    if (normalizedBlockedIP.endsWith('*') || normalizedBlockedIP.endsWith('.')) {
      const prefix = normalizedBlockedIP.replace(/\*$/, '').replace(/\.$/, '.');
      if (normalizedUserIp.startsWith(prefix)) {
        return { allowed: false, reason: 'Your IP address has been blocked' };
      }
    }

    // CIDR notation support (basic /24, /16, /8)
    if (normalizedBlockedIP.includes('/')) {
      if (ipMatchesCIDR(normalizedUserIp, normalizedBlockedIP)) {
        return { allowed: false, reason: 'Your IP address has been blocked' };
      }
    }
  }

  return { allowed: true };
}

/**
 * Check if content contains forbidden words
 */
export function checkForbiddenContent(
  content: string,
  title: string | undefined,
  forbidContents: string[] | undefined
): ModerationResult {
  if (!forbidContents || forbidContents.length === 0) {
    return { allowed: true };
  }

  const textToCheck = `${title || ''} ${content}`.toLowerCase();

  for (const forbidden of forbidContents) {
    const normalizedForbidden = forbidden.trim().toLowerCase();

    // Skip empty entries
    if (!normalizedForbidden) continue;

    if (textToCheck.includes(normalizedForbidden)) {
      return {
        allowed: false,
        reason: 'Your post contains prohibited content'
      };
    }
  }

  return { allowed: true };
}

/**
 * Simple in-memory rate limiter
 * Note: This resets on worker restart. For production, use KV or Durable Objects.
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit: 10 posts per minute per IP
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export function checkRateLimit(userIp: string): ModerationResult {
  const now = Date.now();
  const key = `rate:${userIp}`;

  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    // Start new window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= RATE_LIMIT_COUNT) {
    const secondsRemaining = Math.ceil((existing.resetTime - now) / 1000);
    return {
      allowed: false,
      reason: `Too many posts. Please wait ${secondsRemaining} seconds.`
    };
  }

  // Increment counter
  existing.count++;
  return { allowed: true };
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Combined moderation check for an organization
 */
export function checkModeration(
  organization: Organization,
  userIp: string,
  content: string,
  title?: string
): ModerationResult {
  // Check IP blocking (from organization metadata)
  const blockedIPs = organization.metadata?.blockedIPs;
  const ipCheck = checkIPBlocked(userIp, blockedIPs);
  if (!ipCheck.allowed) {
    return ipCheck;
  }

  // Check forbidden content (from organization metadata)
  const forbidContents = organization.metadata?.forbidContents;
  const contentCheck = checkForbiddenContent(content, title, forbidContents);
  if (!contentCheck.allowed) {
    return contentCheck;
  }

  // Check rate limit
  const rateCheck = checkRateLimit(userIp);
  if (!rateCheck.allowed) {
    return rateCheck;
  }

  return { allowed: true };
}

/**
 * Basic CIDR matching for IPv4
 */
function ipMatchesCIDR(ip: string, cidr: string): boolean {
  try {
    const [cidrIP, cidrMask] = cidr.split('/');
    const mask = parseInt(cidrMask, 10);

    if (isNaN(mask) || mask < 0 || mask > 32) {
      return false;
    }

    const ipNum = ipToNumber(ip);
    const cidrNum = ipToNumber(cidrIP);

    if (ipNum === null || cidrNum === null) {
      return false;
    }

    // Create mask
    const maskNum = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;

    return (ipNum & maskNum) === (cidrNum & maskNum);
  } catch {
    return false;
  }
}

/**
 * Convert IPv4 address to number
 */
function ipToNumber(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) {
    return null;
  }

  let num = 0;
  for (const part of parts) {
    const octet = parseInt(part, 10);
    if (isNaN(octet) || octet < 0 || octet > 255) {
      return null;
    }
    num = (num << 8) | octet;
  }

  return num >>> 0; // Convert to unsigned
}
