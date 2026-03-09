import type { ModerationResult } from './moderation';

interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        response: token,
        remoteip: remoteIp,
      }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    'error-codes'?: string[];
  };

  return {
    success: data.success,
    errorCodes: data['error-codes'],
  };
}

function isTurnstileEnabled(secret?: string): boolean {
  return !!secret;
}

export async function checkTurnstile(
  secret: string | undefined,
  formData: FormData,
  userIp: string,
): Promise<ModerationResult> {
  if (!isTurnstileEnabled(secret)) {
    return { allowed: true };
  }

  const turnstileToken = formData.get('cf-turnstile-response');
  if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.length > 4096) {
    return { allowed: false, reason: 'Captcha verification required' };
  }

  const result = await verifyTurnstile(secret!, turnstileToken, userIp);
  if (!result.success) {
    console.warn('Turnstile verification failed:', result.errorCodes);
    return { allowed: false, reason: 'Captcha verification failed' };
  }

  return { allowed: true };
}
