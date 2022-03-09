import * as mongoose from 'mongoose';
import * as bctyptjs from 'bcryptjs';

interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    fileIDs: Array<string>;
}

const userSchema = new mongoose.Schema<IUser>({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    fileIDs: [
        {type: String}
    ]
})

userSchema.pre('save', async function (next) {
    if(this.isModified('password')) {
        this.password = await bctyptjs.hash(this.password, 8);
    }
    next();
})

const User = mongoose.model('User',userSchema);

export default User;