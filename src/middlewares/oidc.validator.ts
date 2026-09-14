import { ValidationError } from '../utils/customErrors.js';
import { type Request, type Response, type NextFunction } from 'express';
import { bootEnv } from '../config/bootConfig.js';

const OIDC_ENABLED = bootEnv.OIDC_ENABLED;

export function validateOidcEnabled(req: Request, res: Response, next: NextFunction) {
    if (!OIDC_ENABLED) {
        return next(new ValidationError('OIDC is not enabled'));
    }
    next();
}
