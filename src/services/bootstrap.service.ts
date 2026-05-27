import { bootEnv } from '../config/bootConfig.js';
import { getLogger } from '../utils/logger.js';
import * as userRepository from '../repositories/user.repository.js';
import * as serviceClientRepository from '../repositories/serviceClient.repository.js';

const logger = getLogger().setTag('bootstrap.service.ts');

const defaultServiceClients = [
    { clientId: 'scope-manager', clientSecret: bootEnv.SCOPE_MANAGER_CLIENT_SECRET },
    { clientId: 'registry', clientSecret: bootEnv.REGISTRY_CLIENT_SECRET },
    { clientId: 'computer', clientSecret: bootEnv.COMPUTER_CLIENT_SECRET },
    { clientId: 'fetcher', clientSecret: bootEnv.FETCHER_CLIENT_SECRET },
    { clientId: 'reporter', clientSecret: bootEnv.REPORTER_CLIENT_SECRET },
    { clientId: 'director', clientSecret: bootEnv.DIRECTOR_CLIENT_SECRET },
];

export const createDefaultAdminUser = async () => {
    const username = bootEnv.DEFAULT_ADMIN_USERNAME;
    const password = bootEnv.DEFAULT_ADMIN_PASSWORD;

    if (!username || !password) {
        logger.info('Default admin user not configured');
        return;
    }

    await userRepository.upsertDefaultAdminUser(username, password);

    logger.info(`Default admin user '${username}' ready`);
};

export const createDefaultServiceClients = async () => {
    for (const serviceClient of defaultServiceClients) {
        if (!serviceClient.clientSecret) {
            logger.info(`Default service client '${serviceClient.clientId}' not configured`);
            continue;
        }

        await serviceClientRepository.upsertDefaultServiceClient(
            serviceClient.clientId,
            serviceClient.clientSecret,
        );

        logger.info(`Default service client '${serviceClient.clientId}' ready`);
    }
};
