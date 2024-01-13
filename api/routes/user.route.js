import express from "express";
import { updateUser, deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/VerifyUser.js";

const router = express.Router();

router.put('/update/:id', verifyToken, updateUser)
router.delete('/delete/:id', verifyToken, deleteUser)

export default router;