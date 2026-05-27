import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {
    validateCreateUser,
    validateUpdateUser,
    validateLogin,
    validateRefreshToken,
    validateChangePassword,
} from '../middlewares/user.validator.js';
import { validateOidcEnabled } from '../middlewares/oidc.validator.js';
import { validateMongoId } from '../middlewares/mongoId.validator.js';
import { checkUserAuthentication, hasRole } from '../middlewares/user.authenticator.js';
import { SystemRole } from '../types/systemRole.js';

export const userRoutes = Router();

userRoutes.get(
    '/users',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    userController.getUsers,
);

userRoutes.post(
    '/users',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    validateCreateUser,
    userController.createUser,
);

userRoutes.get('/users/me', checkUserAuthentication, userController.getCurrentUser);

userRoutes.put(
    '/users/me/password',
    checkUserAuthentication,
    validateChangePassword,
    userController.changeCurrentUserPassword,
);

userRoutes.get(
    '/users/me/sessions',
    checkUserAuthentication,
    userController.getCurrentUserSessions,
);

userRoutes.delete(
    '/users/me/sessions',
    checkUserAuthentication,
    userController.deleteCurrentUserSessions,
);

userRoutes.delete(
    '/users/me/sessions/:id',
    checkUserAuthentication,
    userController.deleteCurrentUserSession,
);

userRoutes.get(
    '/users/username/:username',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    userController.getUserByUsername,
);

userRoutes.put(
    '/users/username/:username',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    validateUpdateUser,
    userController.updateUserByUsername,
);

userRoutes.delete(
    '/users/username/:username',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    userController.deleteUserByUsername,
);

userRoutes.get(
    '/users/:id',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    validateMongoId,
    userController.getUserById,
);

userRoutes.put(
    '/users/:id',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    validateMongoId,
    validateUpdateUser,
    userController.updateUserById,
);

userRoutes.delete(
    '/users/:id',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    validateMongoId,
    userController.deleteUserById,
);

userRoutes.post('/users/login', validateLogin, userController.login);

userRoutes.post('/users/refresh', validateRefreshToken, userController.refresh);

userRoutes.post('/users/logout', validateRefreshToken, userController.logout);

userRoutes.post('/users/oidc/login', validateOidcEnabled, userController.oidcLogin);

userRoutes.get('/users/oidc/callback', validateOidcEnabled, userController.oidcCallback);
