import User, { IUser } from '../models/user.model.js';
import { Types } from 'mongoose';
import { SystemRole } from '../types/systemRole.js';
import { UserStatus } from '../types/userStatus.js';
import { DuplicateKeyError } from '../utils/customErrors.js';
import { type UserSearchFilters } from '../types/user.js';

export const createUser = async (data: Partial<IUser>) => {
    try {
        const user = new User(data);
        const savedUser = await user.save();

        // exclude password from the returned user object (edge case, as select: false)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = savedUser.toObject();
        return userWithoutPassword;
    } catch (err) {
        const e = err as {
            code?: number;
            keyPattern?: { email?: number; username?: number };
            keyValue?: unknown;
            message?: string;
        };

        if (e.code === 11000) {
            if (e.keyPattern?.email) {
                throw new DuplicateKeyError(
                    'A user with that email already exists',
                    e.keyValue || e.message,
                );
            } else if (e.keyPattern?.username) {
                throw new DuplicateKeyError(
                    'A user with that username already exists',
                    e.keyValue || e.message,
                );
            }
        }
        throw err;
    }
};

export const upsertDefaultAdminUser = async (username: string, password: string) => {
    const defaultAdminUser = await User.findOneAndUpdate(
        { username },
        {
            username,
            password,
            email: `${username}@authenticator.local`,
            name: 'Default',
            surname: 'Admin',
            systemRole: SystemRole.ADMIN,
            status: UserStatus.ACTIVE,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    return defaultAdminUser;
};

export const getUsers = async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
        User.find().skip(skip).limit(limit),
        User.countDocuments(),
    ]);

    return { users, totalItems };
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const searchUsers = async (page: number, limit: number, filters: UserSearchFilters) => {
    const skip = (page - 1) * limit;
    const query: Record<string, unknown> = {};
    if (filters.usernameOrEmail) {
        const usernameOrEmailRegex = new RegExp(escapeRegex(filters.usernameOrEmail), 'i');
        query.$or = [{ username: usernameOrEmailRegex }, { email: usernameOrEmailRegex }];
    }
    if (filters.username) {
        query.username = new RegExp(escapeRegex(filters.username), 'i');
    }
    if (filters.email) {
        query.email = new RegExp(escapeRegex(filters.email), 'i');
    }
    if (filters.systemRole) {
        query.systemRole = filters.systemRole;
    }
    if (filters.status) {
        query.status = filters.status;
    }
    const [users, totalItems] = await Promise.all([
        User.find(query).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);

    return { users, totalItems };
};

export const getUserById = async (id: string) => {
    return await User.findById(id);
};

export const getUserByIdWithPassword = async (id: string) => {
    return await User.findById(id).select('+password');
};

export const getUserByUsername = async (username: string) => {
    return await User.findOne({ username });
};

export const getUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const getUserByRefreshTokenHash = async (refreshTokenHash: string) => {
    return await User.findOne({
        refreshTokens: {
            $elemMatch: {
                tokenHash: refreshTokenHash,
                expiresAt: { $gt: new Date() },
            },
        },
    }).select('+refreshTokens');
};

export const getUserWithRefreshTokens = async (id: string) => {
    return await User.findById(id).select('+refreshTokens');
};

export const updateUserById = async (id: string, data: Partial<IUser>) => {
    try {
        return await User.findByIdAndUpdate(id, data, { new: true });
    } catch (err) {
        const e = err as {
            code?: number;
            keyPattern?: { email?: number; username?: number };
            keyValue?: unknown;
            message?: string;
        };
        if (e.code === 11000) {
            if (e.keyPattern?.email) {
                throw new DuplicateKeyError(
                    'A user with that email already exists',
                    e.keyValue || e.message,
                );
            } else if (e.keyPattern?.username) {
                throw new DuplicateKeyError(
                    'A user with that username already exists',
                    e.keyValue || e.message,
                );
            }
        }
        throw err;
    }
};

export const updateUserByUsername = async (username: string, data: Partial<IUser>) => {
    try {
        return await User.findOneAndUpdate({ username }, data, { new: true });
    } catch (err) {
        const e = err as {
            code?: number;
            keyPattern?: { email?: number; username?: number };
            keyValue?: unknown;
            message?: string;
        };
        if (e.code === 11000) {
            if (e.keyPattern?.email) {
                throw new DuplicateKeyError(
                    'A user with that email already exists',
                    e.keyValue || e.message,
                );
            } else if (e.keyPattern?.username) {
                throw new DuplicateKeyError(
                    'A user with that username already exists',
                    e.keyValue || e.message,
                );
            }
        }
        throw err;
    }
};

export const deleteUserById = async (id: string) => {
    return await User.findByIdAndDelete(id);
};

export const deleteUserByUsername = async (username: string) => {
    return await User.findOneAndDelete({ username });
};

export const addRefreshToken = async (
    id: string,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
) => {
    await User.findByIdAndUpdate(id, {
        $pull: {
            refreshTokens: {
                expiresAt: { $lte: new Date() },
            },
        },
    });

    return await User.findByIdAndUpdate(
        id,
        {
            $push: {
                refreshTokens: {
                    tokenHash: refreshTokenHash,
                    expiresAt: refreshTokenExpiresAt,
                    createdAt: new Date(),
                    lastUsedAt: new Date(),
                },
            },
        },
        { new: true },
    );
};

export const getRefreshTokenByHash = async (refreshTokenHash: string) => {
    const user = await getUserByRefreshTokenHash(refreshTokenHash);
    return user?.refreshTokens?.find(
        (storedToken) =>
            storedToken.tokenHash === refreshTokenHash && storedToken.expiresAt > new Date(),
    );
};

export const rotateRefreshToken = async (
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
    nextRefreshTokenExpiresAt: Date,
) => {
    return await User.findOneAndUpdate(
        {
            'refreshTokens.tokenHash': currentRefreshTokenHash,
            'refreshTokens.expiresAt': { $gt: new Date() },
        },
        {
            $set: {
                'refreshTokens.$.tokenHash': nextRefreshTokenHash,
                'refreshTokens.$.expiresAt': nextRefreshTokenExpiresAt,
                'refreshTokens.$.lastUsedAt': new Date(),
            },
        },
        { new: true },
    );
};

export const removeRefreshTokenByHash = async (refreshTokenHash: string) => {
    return await User.findOneAndUpdate(
        { 'refreshTokens.tokenHash': refreshTokenHash },
        { $pull: { refreshTokens: { tokenHash: refreshTokenHash } } },
        { new: true },
    );
};

export const removeRefreshTokenById = async (userId: string, refreshTokenId: string) => {
    if (!Types.ObjectId.isValid(refreshTokenId)) return null;

    return await User.findOneAndUpdate(
        { _id: userId, 'refreshTokens._id': refreshTokenId },
        { $pull: { refreshTokens: { _id: new Types.ObjectId(refreshTokenId) } } },
        { new: true },
    );
};

export const removeAllRefreshTokens = async (userId: string) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $set: { refreshTokens: [] } },
        { new: false },
    ).select('+refreshTokens');

    if (!user) return null;

    return user.refreshTokens?.length ?? 0;
};

export const cleanupExpiredRefreshTokens = async (userId: string) => {
    return await User.findByIdAndUpdate(
        userId,
        {
            $pull: {
                refreshTokens: {
                    expiresAt: { $lte: new Date() },
                },
            },
        },
        { new: true },
    );
};

export const updateLastLoginAt = async (id: string) => {
    return await User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true });
};

export const findUserByLoginHandle = async (loginHandle: string) => {
    return User.findOne({
        $or: [{ username: loginHandle }, { email: loginHandle }],
    }).select('+password'); // IMPORTANT: Don't use this function for any purposes other than logging in.
};
