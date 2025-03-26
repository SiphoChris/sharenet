import express from "express";
import { registerUser, loginUser,getUsers } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);
userRouter.get("/allusers", getUsers);
export default userRouter;

