import ServiceClient from '../models/serviceClient.model.js';

export const getServiceClients = async () => {
    return await ServiceClient.find();
};

export const getServiceClientByClientId = async (clientId: string) => {
    return await ServiceClient.findOne({ clientId });
};

export const getServiceClientByClientIdWithSecret = async (clientId: string) => {
    return await ServiceClient.findOne({ clientId }).select('+clientSecret');
};

export const updateServiceClientLastUsedAt = async (clientId: string) => {
    return await ServiceClient.findOneAndUpdate(
        { clientId },
        { lastUsedAt: new Date() },
        { new: true },
    );
};

export const upsertDefaultServiceClient = async (clientId: string, clientSecret: string) => {
    return await ServiceClient.findOneAndUpdate(
        { clientId },
        {
            clientId,
            clientSecret,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
    );
};
