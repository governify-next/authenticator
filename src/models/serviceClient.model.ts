import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IServiceClient extends Document {
    clientId: string;
    clientSecret: string;
    lastUsedAt?: Date;
    validateSecret(secret: string): Promise<boolean>;
}

const serviceClientSchema = new Schema<IServiceClient>(
    {
        clientId: { type: String, required: true, unique: true },
        clientSecret: { type: String, required: true, select: false },
        lastUsedAt: { type: Date },
    },
    { timestamps: true },
);

serviceClientSchema.pre('save', async function () {
    if (!this.isModified('clientSecret')) {
        return;
    }

    this.clientSecret = await bcrypt.hash(this.clientSecret, 10 /* SALT_ROUNDS */);
});

serviceClientSchema.pre('findOneAndUpdate', async function () {
    const update = this.getUpdate() as {
        clientSecret?: string;
        $set?: { clientSecret?: string };
    } | null;
    if (!update) return;

    if (update.clientSecret) {
        update.clientSecret = await bcrypt.hash(update.clientSecret, 10 /* SALT_ROUNDS */);
    } else if (update.$set?.clientSecret) {
        update.$set.clientSecret = await bcrypt.hash(
            update.$set.clientSecret,
            10 /* SALT_ROUNDS */,
        );
    }
});

serviceClientSchema.methods.validateSecret = async function (this: IServiceClient, secret: string) {
    return bcrypt.compare(secret, this.clientSecret);
};

const ServiceClient = mongoose.model<IServiceClient>('ServiceClient', serviceClientSchema);
export default ServiceClient;
