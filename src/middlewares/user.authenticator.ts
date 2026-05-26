import jwt from 'jsonwebtoken';
import { ForbiddenError, UnauthorizedError } from '../utils/customErrors.js';
import { type Request, type Response, type NextFunction } from 'express';
import { Types } from 'mongoose';
import { getLogger } from '../utils/logger.js';
import { SystemRole } from '../types/systemRole.js';
import { bootEnv } from '../config/bootConfig.js';

const logger = getLogger().setTag('authentication.ts');

const JWT_SECRET = bootEnv.JWT_SECRET;

declare module 'express' {
    interface Request {
        userAuth?: UserJwtPayload;
    }
}

export interface UserJwtPayload {
    userId: Types.ObjectId;
    username: string;
    systemRole: SystemRole;
}

export const checkUserAuthentication = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new UnauthorizedError('Authorization header missing or malformed'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserJwtPayload;

        req.userAuth = decoded; // Attach UserJwtPayload to the Request for downstream use
        next();
    } catch (err) {
        logger.debug('JWT verification failed', err);
        next(new UnauthorizedError('Invalid or expired token'));
    }
};

export const hasRole = (requiredRole: SystemRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.userAuth) {
            return next(new UnauthorizedError('User not authenticated'));
        }

        const userRole = req.userAuth.systemRole;
        if (userRole !== requiredRole) {
            return next(new ForbiddenError('Insufficient permissions'));
        }

        next();
    };
};
