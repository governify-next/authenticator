import { body, validationResult } from 'express-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { ValidationError } from '../utils/customErrors.js';

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError('Validation failed', errors.array()));
    }
    next();
};

const clientIdValidation = (field: string) =>
    body(field)
        .exists({ checkNull: true })
        .withMessage('Client id is required')
        .isString()
        .withMessage('Client id must be a string')
        .isLength({ min: 3 })
        .withMessage('Client id must be at least 3 characters long')
        .isLength({ max: 100 })
        .withMessage('Client id must be at most 100 characters long');

const clientSecretValidation = (field: string) =>
    body(field)
        .exists({ checkNull: true })
        .withMessage('Client secret is required')
        .isString()
        .withMessage('Client secret must be a string')
        .isLength({ min: 12 })
        .withMessage('Client secret must be at least 12 characters long');

export const validateServiceTokenBody = [
    clientIdValidation('clientId'),
    clientSecretValidation('clientSecret'),
    validateRequest,
];
