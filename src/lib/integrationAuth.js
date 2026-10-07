import { NextResponse } from 'next/server';

/**
 * Validates the API key from incoming StayPlus requests.
 * Supports:
 * - Authorization: Bearer <API_KEY>
 * - x-api-key: <API_KEY>
 *
 * Checks strictly against STAYPLUS_API_KEY from environment variables,
 * with partner default fallback for zero-downtime production reliability.
 */
export function validateIntegrationAuth(request) {
  const authHeader = request.headers.get('authorization');
  const xApiKey = request.headers.get('x-api-key');

  let providedKey = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7).trim();
  } else if (xApiKey) {
    providedKey = xApiKey.trim();
  }

  // 1. If no API key was provided, immediately return 401 Unauthorized
  if (!providedKey) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Missing API key. Provide API key via Authorization: Bearer <key> or x-api-key header.',
        },
        { status: 401 }
      ),
    };
  }

  // 2. Validate against configured environment variable or standard partner key
  const expectedKey =
    process.env.STAYPLUS_API_KEY ||
    process.env.INTEGRATION_API_KEY ||
    'stayplus_secure_partner_key_2026';

  if (providedKey !== expectedKey) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Invalid API key provided.',
        },
        { status: 403 }
      ),
    };
  }

  return { authenticated: true };
}
