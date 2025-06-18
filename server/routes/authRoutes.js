import express from 'express'
import { register,logout,login, sendOTP, verifyOTP, isAuthenticated, resetPassword, sendResetOTP ,checkEmail,verifyResetOTP} from '../controller/authController.js';
import userAuth from '../middleware/userAuth.js';
import events from 'events';
events.EventEmitter.defaultMaxListeners = 20; 


const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/logout',logout)
authRouter.post('/login',login);
/*authRouter.post('/send-otp',userAuth,sendOTP);
authRouter.post('/verify-otp',userAuth,verifyOTP);*/
authRouter.post('/send-otp',sendOTP);
authRouter.post('/verify-otp',verifyOTP);
authRouter.post('/is-auth',userAuth,isAuthenticated);
authRouter.post('/reset-password',resetPassword);
authRouter.post('/send-reset-otp',sendResetOTP);
authRouter.post('/check-email', checkEmail);
authRouter.post('/verify-reset-otp',verifyResetOTP)


export default authRouter;