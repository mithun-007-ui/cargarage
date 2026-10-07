import { NextResponse } from 'next/server';

/**
 * Validates the API key from incoming StayPlus requests.
 * Supports:
 * - Authorization: Bearer <API_KEY>
 * - x-api-key: <API_KEY>
 *
 * Checks strictly against STAYPLUS_API_KEY or INTEGRATION_API_KEY from environment variables.
 */
export function validateIntegrationAuth(request) {
  const expectedKey = process.env.STAYPLUS_API_KEY || process.env.INTEGRATION_API_KEY;

  if (!expectedKey) {
    console.error('STAYPLUS_API_KEY is not configured in server environment variables.');
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'ServerConfigurationError',
          message: 'Integration API key is not configured on server.',
        },
        { status: 500 }
      ),
    };
  }

  const authHeader = request.headers.get('authorization');
  const xApiKey = request.headers.get('x-api-key');

  let providedKey = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    providedKey = authHeader.substring(7).trim();
  } else if (xApiKey) {
    providedKey = xApiKey.trim();
  }

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
