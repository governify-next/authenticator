import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { SystemRole } from '../types/systemRole.js';
import { UserStatus } from '../types/userStatus.js';

export interface IUserRefreshToken {
    _id: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    createdBy?: Types.ObjectId;
    name: string;
    surname: string;
    systemRole: SystemRole;
    status: UserStatus;
    lastLoginAt?: Date;
    refreshTokens?: IUserRefreshToken[];
    validatePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, select: false },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, required: true },
        surname: { type: String, required: true },
        systemRole: { type: String, required: true, enum: Object.values(SystemRole) },
        status: {
            type: String,
            required: true,
            enum: Object.values(UserStatus),
            default: UserStatus.ACTIVE,
        },
        lastLoginAt: { type: Date },
        refreshTokens: {
            type: [
                {
                    tokenHash: { type: String, required: true },
                    expiresAt: { type: Date, required: true },
                    createdAt: { type: Date, required: true, default: Date.now },
                    lastUsedAt: { type: Date, required: true, default: Date.now },
                },
            ],
            default: [],
            select: false,
        },
    },
    { timestamps: true },
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10 /* SALT_ROUNDS */);
});

userSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate() as { password?: string; $set?: { password?: string } } | null;
    if (!update) return;

    if (update.password) {
        update.password = await bcrypt.hash(update.password, 10 /* SALT_ROUNDS */);
    } else if (update.$set?.password) {
        update.$set.password = await bcrypt.hash(update.$set.password, 10 /* SALT_ROUNDS */);
    }
});

userSchema.methods.validatePassword = async function (this: IUser, password: string) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
