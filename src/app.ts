import * as express from 'express';
import * as cors from 'cors';
import userRouter from './routers/user.router';

const app = express();


app.use(cors());
app.use(express.json())
app.use('/user',userRouter);


export default app;