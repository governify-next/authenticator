import { Router } from 'express';
import * as serviceClientController from '../controllers/serviceClient.controller.js';
import { validateServiceToken } from '../middlewares/serviceClient.validator.js';
import { checkUserAuthentication, hasRole } from '../middlewares/authenticator.validator.js';
import { SystemRole } from '../types/systemRole.js';

export const serviceClientRoutes = Router();

serviceClientRoutes.post(
    '/services/token',
    validateServiceToken,
    serviceClientController.createServiceToken,
);

serviceClientRoutes.get(
    '/services/clients',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    serviceClientController.getServiceClients,
);

serviceClientRoutes.get(
    '/services/clients/:clientId',
    checkUserAuthentication,
    hasRole(SystemRole.ADMIN),
    serviceClientController.getServiceClientByClientId,
);
