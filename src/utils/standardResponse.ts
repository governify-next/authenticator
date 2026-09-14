import { Response } from 'express';
import { StdError } from './customErrors.js';
import { Pagination } from './pagination.js';

type NormalizedError = {
    message: string;
    httpStatus: number;
    appCode: string;
    details?: unknown;
};

function normalizeError(err: unknown): NormalizedError {
    if (err instanceof StdError) {
        return {
            message: err.message,
            httpStatus: err.httpStatus,
            appCode: err.appCode,
            details: err.details,
        };
    }
    if (err instanceof Error) {
        return { message: err.message, httpStatus: 500, appCode: 'UNKNOWN_ERROR' };
    }
    return { message: 'Unknown error', httpStatus: 500, appCode: 'UNKNOWN_ERROR' };
}

export function sendSuccess(
    res: Response,
    {
        data,
        pagination,
        message = 'OK',
        httpStatus = 200,
        appCode = 'SUCCESS',
    }: {
        data: unknown;
        pagination?: Pagination;
        message?: string;
        httpStatus?: number;
        appCode?: string;
    },
) {
    const response = {
        success: true,
        message,
        httpStatus,
        appCode,
        data,
        ...(pagination ? { pagination } : {}),
        error: null,
    };
    return res.status(httpStatus).json(response);
}

export function sendError(res: Response, err: unknown) {
    const parsed = normalizeError(err);
    const response = {
        success: false,
        message: parsed.message,
        httpStatus: parsed.httpStatus,
        appCode: parsed.appCode,
        data: null,
        error: {
            message: parsed.message,
            details: parsed.details,
        },
    };
    return res.status(parsed.httpStatus).json(response);
}
