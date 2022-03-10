import * as express from 'express';
import * as cors from 'cors';
import * as cookieParser from 'cookie-parser';
import userRouter from './routers/user.router';

const app = express();


app.use(cors({
    origin: ["http://localhost:3000",],
    credentials: true,
    exposedHeaders: ["set-cookie"],
}));
app.use(express.json());
app.use(cookieParser());
app.use('/user',userRouter);


export default app;