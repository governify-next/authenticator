import { Request } from 'express';

export type Pagination = {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};

const getPositiveInteger = (value: unknown, defaultValue: number) => {
    const parsedValue = Number.parseInt(String(value || defaultValue), 10);
    return Number.isNaN(parsedValue) ? defaultValue : Math.max(parsedValue, 1);
};

export const getPaginationQuery = (req: Request) => ({
    page: getPositiveInteger(req.query.page, 1),
    limit: getPositiveInteger(req.query.limit, 20),
});

export const createPagination = (page: number, limit: number, totalItems: number): Pagination => {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1 && page - 1 <= totalPages,
    };
};
