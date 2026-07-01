import { Request } from 'express';
import { ValidationError } from './customErrors.js';

export type Pagination = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

const getPage = (value: unknown, defaultValue: number) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        throw new ValidationError('Validation failed', [
            {
                type: 'field',
                value,
                msg: 'Page must be a positive integer',
                path: 'page',
                location: 'query',
            },
        ]);
    }

    return parsedValue;
};

const getLimit = (value: unknown, defaultValue: number) => {
    if (value === undefined || value === null || value === '') {
        return defaultValue;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 100) {
        throw new ValidationError('Validation failed', [
            {
                type: 'field',
                value,
                msg: 'Limit must be an integer between 1 and 100',
                path: 'limit',
                location: 'query',
            },
        ]);
    }

    return parsedValue;
};

export const getPaginationQuery = (req: Request) => ({
    page: getPage(req.query.page, 1),
    limit: getLimit(req.query.limit, 10),
});

export const createPagination = (page: number, limit: number, totalItems: number): Pagination => {
    const totalPages = Math.ceil(totalItems / limit);
    const maxAvailablePage = Math.max(totalPages, 1);

    if (page > maxAvailablePage) {
        throw new ValidationError('Validation failed', [
            {
                type: 'field',
                value: page,
                msg:
                    totalPages === 0
                        ? 'Page must be 1 when there are no results'
                        : `Page must be between 1 and ${totalPages}`,
                path: 'page',
                location: 'query',
            },
        ]);
    }

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && page - 1 <= totalPages,
    };
};
