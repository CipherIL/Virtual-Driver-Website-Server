import * as express from 'express';
import * as controller from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/register', controller.registerUser);
userRouter.get('/login',controller.loginUser);
userRouter.get('/logout',controller.logoutUser);

export default userRouter;