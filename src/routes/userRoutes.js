import { Router } from "express";
import { validateToken } from "../utils/jwt_validate.js";
import { editAuthenticatedUserController, getAuthenticatedUserController } from "../controller/userController.js";
import upload from "../utils/image_handler.js";
const userRouter = Router();

userRouter.use(validateToken);
userRouter.get('/getAuthenticatedUser' , getAuthenticatedUserController);
userRouter.put('/editAuthenticatedUser', upload.single('file') , editAuthenticatedUserController)


export default userRouter;