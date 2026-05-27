import { SystemRole } from './systemRole.js';
import { UserStatus } from './userStatus.js';

export type User = {
    username: string;
    email: string;
    password: string;
    name: string;
    surname: string;
    systemRole: SystemRole;
    status: UserStatus;
    lastLoginAt?: Date;
};
