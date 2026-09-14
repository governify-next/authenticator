import { Router } from 'express';
import * as serviceClientController from '../controllers/serviceClient.controller.js';
import { validateServiceTokenBody } from '../middlewares/serviceClient.validator.js';
import { checkUserAuthentication, hasSystemRole } from '../middlewares/authenticator.validator.js';
import { SystemRole } from '../types/systemRole.js';

export const serviceClientRoutes = Router();

serviceClientRoutes.post(
    '/services/token',
    validateServiceTokenBody,
    serviceClientController.createServiceToken,
);

serviceClientRoutes.get(
    '/services/clients',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    serviceClientController.getServiceClients,
);

serviceClientRoutes.get(
    '/services/clients/:clientId',
    checkUserAuthentication,
    hasSystemRole(SystemRole.ADMIN),
    serviceClientController.getServiceClientByClientId,
);
