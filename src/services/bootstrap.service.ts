import { bootEnv } from '../config/bootConfig.js';
import { SystemRole } from '../types/systemRole.js';
import { UserStatus } from '../types/userStatus.js';
import { getLogger } from '../utils/logger.js';
import * as userRepository from '../repositories/user.repository.js';

const logger = getLogger().setTag('bootstrap.service.ts');

export const createDefaultAdminUser = async () => {
    const username = bootEnv.DEFAULT_ADMIN_USERNAME;
    const password = bootEnv.DEFAULT_ADMIN_PASSWORD;

    if (!username || !password) {
        logger.info('Default admin user not configured');
        return;
    }

    const existingUser = await userRepository.getUserByUsername(username);
    if (existingUser) {
        logger.info(`Default admin user '${username}' already exists`);
        return;
    }

    await userRepository.createUser({
        username,
        password,
        email: `${username}@authenticator.local`,
        name: 'Default',
        surname: 'Admin',
        systemRole: SystemRole.ADMIN,
        status: UserStatus.ACTIVE,
    });

    logger.info(`Default admin user '${username}' created`);
};
