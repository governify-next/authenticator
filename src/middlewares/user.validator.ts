import { body, validationResult } from 'express-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../utils/customErrors.js';
import { SystemRole } from '../types/systemRole.js';
import { UserStatus } from '../types/userStatus.js';

const usernameValidation = (field: string) =>
    body(field)
        .exists({ checkNull: true })
        .withMessage('Username is required')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long')
        .isLength({ max: 50 })
        .withMessage('Username must be at most 50 characters long');

export const validateUsername = [
    usernameValidation('username'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return next(new ValidationError('Validation failed', errors.array()));
        next();
    },
];

export const validateCreateUser = [
    usernameValidation('username'),
    body('email')
        .exists({ checkNull: true })
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .exists({ checkNull: true })
        .withMessage('Password is required')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .exists({ checkNull: true })
        .withMessage('Name is required')
        .isString()
        .withMessage('Name must be a string')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long')
        .isLength({ max: 30 })
        .withMessage('Name must be at most 30 characters long'),
    body('surname')
        .exists({ checkNull: true })
        .withMessage('Surname is required')
        .isString()
        .withMessage('Surname must be a string')
        .isLength({ min: 2 })
        .withMessage('Surname must be at least 2 characters long')
        .isLength({ max: 50 })
        .withMessage('Surname must be at most 50 characters long'),
    body('systemRole')
        .exists({ checkNull: true })
        .withMessage('System role is required')
        .isIn(Object.values(SystemRole))
        .withMessage(`System role must be one of: ${Object.values(SystemRole).join(', ')}`),
    body('status')
        .optional()
        .isIn(Object.values(UserStatus))
        .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];

export const validateUpdateUser = [
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('password')
        .optional()
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('name')
        .optional()
        .isString()
        .withMessage('Name must be a string')
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters long')
        .isLength({ max: 30 })
        .withMessage('Name must be at most 30 characters long'),
    body('surname')
        .optional()
        .isString()
        .withMessage('Surname must be a string')
        .isLength({ min: 2 })
        .withMessage('Surname must be at least 2 characters long')
        .isLength({ max: 50 })
        .withMessage('Surname must be at most 50 characters long'),
    body('systemRole')
        .optional()
        .isIn(Object.values(SystemRole))
        .withMessage(`System role must be one of: ${Object.values(SystemRole).join(', ')}`),
    body('status')
        .optional()
        .isIn(Object.values(UserStatus))
        .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];

export const validateSearchUsers = [
    body('usernameOrEmail')
        .optional()
        .isString()
        .withMessage('Username or email filter must be a string')
        .isLength({ min: 1, max: 100 })
        .withMessage('Username or email filter must be between 1 and 100 characters long'),
    body('username')
        .optional()
        .isString()
        .withMessage('Username filter must be a string')
        .isLength({ min: 1, max: 50 })
        .withMessage('Username filter must be between 1 and 50 characters long'),
    body('email')
        .optional()
        .isString()
        .withMessage('Email filter must be a string')
        .isLength({ min: 1, max: 100 })
        .withMessage('Email filter must be between 1 and 100 characters long'),
    body('systemRole')
        .optional()
        .isIn(Object.values(SystemRole))
        .withMessage(`System role must be one of: ${Object.values(SystemRole).join(', ')}`),
    body('status')
        .optional()
        .isIn(Object.values(UserStatus))
        .withMessage(`Status must be one of: ${Object.values(UserStatus).join(', ')}`),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];

export const validateRefreshToken = [
    body('refreshToken')
        .exists({ checkNull: true })
        .withMessage('Refresh token is required')
        .isString()
        .withMessage('Refresh token must be a string'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];

export const validateChangePassword = [
    body('currentPassword')
        .exists({ checkNull: true })
        .withMessage('Current password is required')
        .isString()
        .withMessage('Current password must be a string')
        .isLength({ min: 6 })
        .withMessage('Current password must be at least 6 characters long'),
    body('newPassword')
        .exists({ checkNull: true })
        .withMessage('New password is required')
        .isString()
        .withMessage('New password must be a string')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];

export const validateLogin = [
    body('login')
        .exists({ checkNull: true })
        .withMessage('Login identifier (username or email) is required')
        .isString()
        .withMessage('Login identifier (username or email) must be a string')
        .isLength({ min: 3 })
        .withMessage('Login identifier (username or email) must be at least 3 characters long')
        .isLength({ max: 100 })
        .withMessage('Login identifier (username or email) must be at most 100 characters long'),
    body('password')
        .exists({ checkNull: true })
        .withMessage('Password is required')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ValidationError('Validation failed', errors.array()));
        }
        next();
    },
];
