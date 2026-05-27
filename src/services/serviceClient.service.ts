import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import * as serviceClientRepository from '../repositories/serviceClient.repository.js';
import { IServiceClient } from '../models/serviceClient.model.js';
import { bootEnv } from '../config/bootConfig.js';
import { UnauthorizedError } from '../utils/customErrors.js';

const createServiceTokenValue = (serviceClient: IServiceClient) => {
    const options: jwt.SignOptions = {
        expiresIn: bootEnv.JWT_SERVICE_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        issuer: bootEnv.JWT_ISSUER,
        audience: bootEnv.JWT_AUDIENCE,
        subject: serviceClient.clientId,
        jwtid: randomUUID(),
    };

    return jwt.sign(
        {
            type: 'service',
            service: serviceClient.clientId,
            serviceName: serviceClient.clientId,
        },
        bootEnv.JWT_SECRET,
        options,
    );
};

export const getServiceClients = async () => {
    return await serviceClientRepository.getServiceClients();
};

export const getServiceClientByClientId = async (clientId: string) => {
    return await serviceClientRepository.getServiceClientByClientId(clientId);
};

export const createServiceToken = async (clientId: string, clientSecret: string) => {
    const serviceClient =
        await serviceClientRepository.getServiceClientByClientIdWithSecret(clientId);
    if (!serviceClient) throw new UnauthorizedError('Invalid service credentials');

    const isSecretValid = await serviceClient.validateSecret(clientSecret);
    if (!isSecretValid) throw new UnauthorizedError('Invalid service credentials');

    await serviceClientRepository.updateServiceClientLastUsedAt(clientId);

    return {
        token: createServiceTokenValue(serviceClient),
    };
};
