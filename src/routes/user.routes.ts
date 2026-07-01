import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import {
    validateCreateUser,
    validateUpdateUser,
    validateLogin,
    validateRefreshToken,
    validateChangePassword,
    validateSearchUsers,
} from '../middlewares/user.validator.js';
import { validateOidcEnabled } from '../middlewares/oidc.validator.js';
import { validateMongoId } from '../middlewares/mongoId.validator.js';
import {
    checkUserAuthentication,
    checkServiceAuthentication,
    hasSystemRole,
    isService,
} from '../middlewares/authenticator.validator.js';
import { SystemRole } from '../types/systemRole.js';
import { anyOf } from '../middlewares/anyof.validator.js';

export const userRoutes = Router();

userRoutes.get(
    '/users',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    userController.getUsers,
);

userRoutes.post(
    '/users',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateCreateUser,
    userController.createUser,
);

userRoutes.post(
    '/users/search',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateSearchUsers,
    userController.searchUsers,
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
    '/users/:id/sessions',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateMongoId,
    userController.getUserSessionsById,
);

userRoutes.delete(
    '/users/:id/sessions',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateMongoId,
    userController.deleteUserSessionsById,
);

userRoutes.get(
    '/users/username/:username',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.ADMIN), isService),
    userController.getUserByUsername,
);

userRoutes.put(
    '/users/username/:username',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateUpdateUser,
    userController.updateUserByUsername,
);

userRoutes.delete(
    '/users/username/:username',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    userController.deleteUserByUsername,
);

userRoutes.get(
    '/users/:id',
    anyOf(checkUserAuthentication, checkServiceAuthentication),
    anyOf(hasSystemRole(SystemRole.ADMIN), isService),
    validateMongoId,
    userController.getUserById,
);

userRoutes.put(
    '/users/:id',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateMongoId,
    validateUpdateUser,
    userController.updateUserById,
);

userRoutes.delete(
    '/users/:id',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    validateMongoId,
    userController.deleteUserById,
);

userRoutes.post('/users/login', validateLogin, userController.login);

userRoutes.post('/users/refresh', validateRefreshToken, userController.refresh);

userRoutes.post('/users/logout', validateRefreshToken, userController.logout);

userRoutes.post('/users/oidc/login', validateOidcEnabled, userController.oidcLogin);

userRoutes.get('/users/oidc/callback', validateOidcEnabled, userController.oidcCallback);
