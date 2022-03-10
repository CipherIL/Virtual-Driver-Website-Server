import * as express from 'express';
import * as controller from '../controllers/user.controller';

const userRouter = express.Router();

userRouter.post('/register', controller.registerUser);
userRouter.post('/login',controller.loginUser);
userRouter.get('/logout',controller.logoutUser);
userRouter.get('/token-relogin',controller.tokenRelogin);

export default userRouter;