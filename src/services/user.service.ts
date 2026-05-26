import * as userRepository from '../repositories/user.repository.js';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { URL } from 'node:url';
import { IUser } from '../models/user.model.js';
import * as oidc from 'openid-client';
import { UnauthorizedError } from '../utils/customErrors.js';
import { bootEnv } from '../config/bootConfig.js';
import { getLogger } from '../utils/logger.js';

const logger = getLogger().setTag('user.service.ts');

let oidcConfig: oidc.Configuration | null = null;
if (bootEnv.OIDC_ENABLED) {
    oidcConfig = await oidc.discovery(
        bootEnv.OIDC_ISSUER_URL,
        bootEnv.OIDC_CLIENT_ID,
        bootEnv.OIDC_CLIENT_SECRET,
    );
}

export const createUser = async (data: Partial<IUser>) => {
    return await userRepository.createUser(data);
};

export const getUsers = async () => {
    return await userRepository.getUsers();
};

export const getUserById = async (id: string) => {
    return await userRepository.getUserById(id);
};

export const getUserByUsername = async (username: string) => {
    return await userRepository.getUserByUsername(username);
};

export const updateUserById = async (id: string, data: Partial<IUser>) => {
    return await userRepository.updateUserById(id, data);
};

export const updateUserByUsername = async (username: string, data: Partial<IUser>) => {
    return await userRepository.updateUserByUsername(username, data);
};

export const deleteUserById = async (id: string) => {
    return await userRepository.deleteUserById(id);
};

export const deleteUserByUsername = async (username: string) => {
    return await userRepository.deleteUserByUsername(username);
};

export const login = async (login: string, password: string) => {
    const user = await userRepository.findUserByLoginHandle(login);
    if (!user) throw new UnauthorizedError('Invalid login identifier');

    const isMatch = await user.validatePassword(password);
    if (!isMatch) throw new UnauthorizedError('Invalid password');

    const { username, systemRole } = user;
    const userId = user._id;

    return jwt.sign({ userId, username, systemRole }, bootEnv.JWT_SECRET, { expiresIn: '1d' });
};

export const oidcLogin = async () => {
    const loginUrl = oidc.buildAuthorizationUrl(oidcConfig!, {
        redirect_uri: bootEnv.OIDC_REDIRECT_URI,
        scope: bootEnv.OIDC_SCOPE,
    });

    return loginUrl;
};

export const oidcCallback = async (req: Request) => {
    const host = req.get('host');
    if (!host) {
        throw new UnauthorizedError('Missing host header');
    }

    const callbackUrl = new URL(req.originalUrl, `https://${host}`);

    let tokens;

    try {
        tokens = await oidc.authorizationCodeGrant(oidcConfig!, callbackUrl);
    } catch (error) {
        logger.debug('OIDC callback failed', error);
        throw new UnauthorizedError('Failed to process OIDC callback');
    }

    const { email } = tokens!.claims()!;

    const user = await userRepository.getUserByEmail(email as string);

    if (!user) {
        throw new UnauthorizedError('No local user is associated with that email address');
    }

    const { username, systemRole } = user;
    const userId = user._id;

    return jwt.sign({ userId, username, systemRole }, bootEnv.JWT_SECRET, { expiresIn: '1d' });
};
