import dotenv from 'dotenv';
import path from 'path';

// Load .env file
const envPath = process.env.GOV_BOOT_ENV_PATH || path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath, quiet: true });

export const bootEnv = {
    // Service configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    GOV_LOG_LEVEL: process.env.GOV_LOG_LEVEL || 'INFO',
    GOV_SERVICE_NAME: process.env.GOV_SERVICE_NAME || 'authenticator',
    PORT: process.env.PORT || '5900',

    // Database URIs
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/governify-next',

    // JWT configuration
    USER_AUTHENTICATION_ENABLED: process.env.USER_AUTHENTICATION_ENABLED === 'true',
    JWT_SECRET: process.env.JWT_SECRET || 'governify_next_secret_key',

    // OpenID Connect configuration
    OIDC_ENABLED: process.env.OIDC_ENABLED === 'true',
    OIDC_ISSUER_URL: new URL(process.env.OIDC_ISSUER_URL || 'https://issuer.example.com'),
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID || '',
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET || '',
    OIDC_REDIRECT_URI:
        process.env.OIDC_REDIRECT_URI || 'http://localhost:5900/api/v1/users/oidc/callback',
    OIDC_SCOPE: process.env.OIDC_SCOPE || 'openid email profile',
};
