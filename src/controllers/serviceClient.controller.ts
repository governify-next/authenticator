import { Request, Response, NextFunction } from 'express';
import * as serviceClientService from '../services/serviceClient.service.js';
import { sendSuccess } from '../utils/standardResponse.js';
import { NotFoundError } from '../utils/customErrors.js';

export const getServiceClients = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceClients = await serviceClientService.getServiceClients();
        return sendSuccess(res, { data: serviceClients });
    } catch (err) {
        next(err);
    }
};

export const getServiceClientByClientId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const serviceClient = await serviceClientService.getServiceClientByClientId(
            req.params.clientId,
        );
        if (!serviceClient) throw new NotFoundError('Service client not found');
        return sendSuccess(res, { data: serviceClient });
    } catch (err) {
        next(err);
    }
};

export const createServiceToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const serviceToken = await serviceClientService.createServiceToken(
            req.body.clientId,
            req.body.clientSecret,
        );
        return sendSuccess(res, { data: serviceToken });
    } catch (err) {
        next(err);
    }
};
