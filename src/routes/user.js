import express from "express";
import UserController from "../controller/User.js";
import Auth from "../common/auth.js";
const router = express.Router();

router.get("/login/:id", Auth.validate, UserController.getUserById);
router.post("/signup", UserController.create);
router.put("/:id", UserController.editUserById);
router.put("/login/:id", Auth.validate, UserController.addUserdetailsById);
router.put("/delete/:id", UserController.deleteUserById);
router.post("/login", UserController.login);
router.post("/forgetPassword", UserController.forgetPassword);
router.post("/resetPassword", UserController.resetPassword);
router.put("/suggestcolor/:id", Auth.validate, UserController.suggestColor);

export default router;
