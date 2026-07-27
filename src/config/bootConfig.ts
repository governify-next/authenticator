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

    // Default superadmin user
    DEFAULT_SUPERADMIN_USERNAME: process.env.DEFAULT_SUPERADMIN_USERNAME || 'superadmin',
    DEFAULT_SUPERADMIN_PASSWORD: process.env.DEFAULT_SUPERADMIN_PASSWORD || 'superadmin123',

    // Default service clients
    SCOPE_MANAGER_CLIENT_SECRET:
        process.env.SCOPE_MANAGER_CLIENT_SECRET || 'scope_manager_client_secret',
    REGISTRY_CLIENT_SECRET: process.env.REGISTRY_CLIENT_SECRET || 'registry_client_secret',
    COMPUTER_CLIENT_SECRET: process.env.COMPUTER_CLIENT_SECRET || 'computer_client_secret',
    FETCHER_CLIENT_SECRET: process.env.FETCHER_CLIENT_SECRET || 'fetcher_client_secret',
    REPORTER_CLIENT_SECRET: process.env.REPORTER_CLIENT_SECRET || 'reporter_client_secret',
    DIRECTOR_CLIENT_SECRET: process.env.DIRECTOR_CLIENT_SECRET || 'director_client_secret',

    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'governify_next_secret_key',
    JWT_ISSUER: process.env.JWT_ISSUER || 'authenticator',
    JWT_AUDIENCE: process.env.JWT_AUDIENCE || 'governify-next',
    JWT_USER_EXPIRES_IN: process.env.JWT_USER_EXPIRES_IN || '15m',
    JWT_USER_REFRESH_TOKEN_DAYS: Number(process.env.JWT_USER_REFRESH_TOKEN_DAYS || '7'),
    JWT_SERVICE_EXPIRES_IN: process.env.JWT_SERVICE_EXPIRES_IN || '9999999m',

    // OpenID Connect configuration
    OIDC_ENABLED: process.env.OIDC_ENABLED === 'true',
    OIDC_ISSUER_URL: new URL(process.env.OIDC_ISSUER_URL || 'https://issuer.example.com'),
    OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID || '',
    OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET || '',
    OIDC_REDIRECT_URI:
        process.env.OIDC_REDIRECT_URI || 'http://localhost:5900/api/v1/users/oidc/callback',
    OIDC_SCOPE: process.env.OIDC_SCOPE || 'openid email profile',
};
