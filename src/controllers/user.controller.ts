import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess } from '../utils/standardResponse.js';
import { NotFoundError } from '../utils/customErrors.js';

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.createUser(req.body);
        return sendSuccess(res, { data: user, httpStatus: 201, message: 'User created' });
    } catch (err) {
        next(err);
    }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.getUsers();
        return sendSuccess(res, { data: users });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: user });
    } catch (err) {
        next(err);
    }
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.getUserByUsername(req.params.username);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: user });
    } catch (err) {
        next(err);
    }
};

export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUserById(req.params.id, req.body);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: user, message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const updateUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.updateUserByUsername(req.params.username, req.body);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: user, message: 'User updated' });
    } catch (err) {
        next(err);
    }
};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.deleteUserById(req.params.id);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: null, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

export const deleteUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.deleteUserByUsername(req.params.username);
        if (!user) throw new NotFoundError('User not found');
        return sendSuccess(res, { data: null, message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = await userService.login(req.body.login, req.body.password);
        return sendSuccess(res, { data: { token } });
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
        const token = await userService.oidcCallback(req);
        return sendSuccess(res, { data: { token } });
    } catch (err) {
        next(err);
    }
};
