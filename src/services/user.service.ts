import * as userRepository from '../repositories/user.repository.js';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { URL } from 'node:url';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { IUser } from '../models/user.model.js';
import { UserStatus } from '../types/userStatus.js';
import * as oidc from 'openid-client';
import { NotFoundError, UnauthorizedError } from '../utils/customErrors.js';
import { bootEnv } from '../config/bootConfig.js';
import { getLogger } from '../utils/logger.js';
import { createPagination } from '../utils/pagination.js';

const logger = getLogger().setTag('user.service.ts');

let oidcConfig: oidc.Configuration | null = null;
if (bootEnv.OIDC_ENABLED) {
    oidcConfig = await oidc.discovery(
        bootEnv.OIDC_ISSUER_URL,
        bootEnv.OIDC_CLIENT_ID,
        bootEnv.OIDC_CLIENT_SECRET,
    );
}

const hashRefreshToken = (refreshToken: string) =>
    createHash('sha256').update(refreshToken).digest('hex');

const getUserId = (user: IUser) => String(user._id);

const ensureUserCanLogin = (user: IUser) => {
    if (user.status && user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedError('User is not active');
    }
};

const createAccessToken = (user: IUser) => {
    const options: jwt.SignOptions = {
        expiresIn: bootEnv.JWT_USER_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        issuer: bootEnv.JWT_ISSUER,
        audience: bootEnv.JWT_AUDIENCE,
        subject: getUserId(user),
        jwtid: randomUUID(),
    };

    return jwt.sign(
        {
            type: 'user',
            userId: getUserId(user),
            username: user.username,
            systemRole: user.systemRole,
        },
        bootEnv.JWT_SECRET,
        options,
    );
};

const createRefreshTokenValue = () => randomBytes(48).toString('base64url');

const createRefreshTokenExpiresAt = () =>
    new Date(Date.now() + bootEnv.JWT_USER_REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

const createRefreshToken = async (user: IUser) => {
    const refreshToken = createRefreshTokenValue();
    const refreshTokenExpiresAt = createRefreshTokenExpiresAt();

    await userRepository.addRefreshToken(
        getUserId(user),
        hashRefreshToken(refreshToken),
        refreshTokenExpiresAt,
    );

    const storedToken = await userRepository.getRefreshTokenByHash(hashRefreshToken(refreshToken));
    if (!storedToken) throw new UnauthorizedError('Failed to create session');

    return { refreshToken, sessionId: String(storedToken._id) };
};

const createSession = async (user: IUser, updateLastLoginAt = false) => {
    ensureUserCanLogin(user);
    const { refreshToken, sessionId } = await createRefreshToken(user);

    if (updateLastLoginAt) {
        await userRepository.updateLastLoginAt(getUserId(user));
    }

    return {
        token: createAccessToken(user),
        refreshToken,
        sessionId,
    };
};

const getActiveSessions = (user: IUser) =>
    (user.refreshTokens || [])
        .filter((session) => session.expiresAt > new Date())
        .map((session) => ({
            _id: String(session._id),
            createdAt: session.createdAt,
            lastUsedAt: session.lastUsedAt,
            expiresAt: session.expiresAt,
        }));

export const createUser = async (data: Partial<IUser>) => {
    return await userRepository.createUser(data);
};

export const getUsers = async (page: number, limit: number) => {
    const { users, totalItems } = await userRepository.getUsers(page, limit);

    return {
        users,
        pagination: createPagination(page, limit, totalItems),
    };
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

export const deleteUserSessionsById = async (id: string) => {
    const user = await userRepository.removeAllRefreshTokens(id);
    if (!user) throw new NotFoundError('User not found');
};

export const login = async (login: string, password: string) => {
    const user = await userRepository.findUserByLoginHandle(login);
    if (!user) throw new UnauthorizedError('Invalid login identifier');

    const isMatch = await user.validatePassword(password);
    if (!isMatch) throw new UnauthorizedError('Invalid password');

    return await createSession(user, true);
};

export const refresh = async (refreshToken: string) => {
    const currentRefreshTokenHash = hashRefreshToken(refreshToken);
    const user = await userRepository.getUserByRefreshTokenHash(currentRefreshTokenHash);
    if (!user) throw new UnauthorizedError('Invalid or expired refresh token');
    ensureUserCanLogin(user);

    const currentSession = user.refreshTokens?.find(
        (storedToken) =>
            storedToken.tokenHash === currentRefreshTokenHash && storedToken.expiresAt > new Date(),
    );
    if (!currentSession) throw new UnauthorizedError('Invalid or expired refresh token');

    const nextRefreshToken = createRefreshTokenValue();
    const updatedUser = await userRepository.rotateRefreshToken(
        currentRefreshTokenHash,
        hashRefreshToken(nextRefreshToken),
        createRefreshTokenExpiresAt(),
    );

    if (!updatedUser) throw new UnauthorizedError('Invalid or expired refresh token');

    return {
        token: createAccessToken(user),
        refreshToken: nextRefreshToken,
        sessionId: String(currentSession._id),
    };
};

export const logout = async (refreshToken: string) => {
    const user = await userRepository.removeRefreshTokenByHash(hashRefreshToken(refreshToken));
    if (!user) throw new UnauthorizedError('Invalid refresh token');
};

export const getCurrentUser = async (userId: string) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    ensureUserCanLogin(user);

    return user;
};

export const getCurrentUserSessions = async (userId: string) => {
    await userRepository.cleanupExpiredRefreshTokens(userId);

    const user = await userRepository.getUserWithRefreshTokens(userId);
    if (!user) throw new UnauthorizedError('User not found');

    return getActiveSessions(user);
};

export const getUserSessionsById = async (userId: string) => {
    await userRepository.cleanupExpiredRefreshTokens(userId);

    const user = await userRepository.getUserWithRefreshTokens(userId);
    if (!user) throw new NotFoundError('User not found');

    return getActiveSessions(user);
};

export const deleteCurrentUserSession = async (userId: string, refreshTokenId: string) => {
    const user = await userRepository.removeRefreshTokenById(userId, refreshTokenId);
    if (!user) throw new NotFoundError('Session not found');
};

export const deleteCurrentUserSessions = async (userId: string) => {
    const user = await userRepository.removeAllRefreshTokens(userId);
    if (!user) throw new UnauthorizedError('User not found');
};

export const changeCurrentUserPassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string,
) => {
    const user = await userRepository.getUserByIdWithPassword(userId);
    if (!user) throw new UnauthorizedError('User not found');
    ensureUserCanLogin(user);

    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) throw new UnauthorizedError('Invalid current password');

    await userRepository.updateUserById(userId, { password: newPassword });
    await userRepository.removeAllRefreshTokens(userId);
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

    return await createSession(user, true);
};
