import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/standardResponse.js';
import { getPaginationQuery } from '../utils/pagination.js';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.createUser(req.body, req.userAuth!.userId);
        return sendSuccess(res, { data: user, httpStatus: 201, message: 'User created' });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = getPaginationQuery(req);
        const { users, pagination } = await userService.getUsers(
            page,
            limit,
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );

        return sendSuccess(res, { data: users, pagination });
    } catch (err) {
        next(err);
    }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page, limit } = getPaginationQuery(req);
        const { users, pagination } = await userService.searchUsers(
            page,
            limit,
            req.body ?? {},
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );

        return sendSuccess(res, { data: users, pagination });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserById(
            req.params.id,
            req.userAuth?.userId,
            req.userAuth?.systemRole,
        );
        return sendSuccess(res, { data: user });
    } catch (err) {
        next(err);
    }
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserByUsername(
            req.params.username,
            req.userAuth?.userId,
            req.userAuth?.systemRole,
        );
        return sendSuccess(res, { data: user });
    } catch (err) {
        next(err);
    }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getCurrentUser(req.userAuth!.userId);
        return sendSuccess(res, { data: user });
    } catch (err) {
        next(err);
    }
};

export const getCurrentUserSessions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessions = await userService.getCurrentUserSessions(req.userAuth!.userId);
        return sendSuccess(res, { data: sessions });
    } catch (err) {
        next(err);
    }
};

export const deleteCurrentUserSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedSessions = await userService.deleteCurrentUserSession(
            req.userAuth!.userId,
            req.params.id,
        );
        return sendSuccess(res, { data: deletedSessions, message: 'Session deleted' });
    } catch (err) {
        next(err);
    }
};

export const deleteCurrentUserSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const deletedSessions = await userService.deleteCurrentUserSessions(req.userAuth!.userId);
        return sendSuccess(res, { data: deletedSessions, message: 'Sessions deleted' });
    } catch (err) {
        next(err);
    }
};

export const changeCurrentUserPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await userService.changeCurrentUserPassword(
            req.userAuth!.userId,
            req.body.currentPassword,
            req.body.newPassword,
        );
        return sendSuccess(res, { data: user, message: 'Password updated' });
    } catch (err) {
        next(err);
    }
};

export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUserById(
            req.params.id,
            req.body,
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );
        return sendSuccess(res, { data: user, message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const updateUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUserByUsername(
            req.params.username,
            req.body,
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );
        return sendSuccess(res, { data: user, message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.deleteUserById(
            req.params.id,
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );
        return sendSuccess(res, { data: user, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

export const deleteUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.deleteUserByUsername(
            req.params.username,
            req.userAuth!.userId,
            req.userAuth!.systemRole,
        );
        return sendSuccess(res, { data: user, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

export const deleteUserSessionsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const deletedSessions = await userService.deleteUserSessionsById(req.params.id);
        return sendSuccess(res, { data: deletedSessions, message: 'User sessions deleted' });
    } catch (err) {
        next(err);
    }
};

export const getUserSessionsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessions = await userService.getUserSessionsById(req.params.id);
        return sendSuccess(res, { data: sessions });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await userService.login(req.body.login, req.body.password);
        return sendSuccess(res, { data: session });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await userService.refresh(req.body.refreshToken);
        return sendSuccess(res, { data: session });
    } catch (err) {
        next(err);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logoutResult = await userService.logout(req.body.refreshToken);
        return sendSuccess(res, { data: logoutResult, message: 'User logged out' });
    } catch (err) {
        next(err);
    }
};

export const oidcLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const loginUrl = await userService.oidcLogin();
        return sendSuccess(res, { data: { loginUrl } });
    } catch (err) {
        next(err);
    }
};

export const oidcCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await userService.oidcCallback(req);
        return sendSuccess(res, { data: session });
    } catch (err) {
        next(err);
    }
};
