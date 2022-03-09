import * as mongoose from 'mongoose';

interface IToken {
    token: string;
}

const tokenSchema = new mongoose.Schema<IToken>({
    token: {
        type: String,
        required: true,
    }
})

const Token = mongoose.model('Token',tokenSchema);

export default Token;