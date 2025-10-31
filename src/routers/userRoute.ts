import express from "express"
import { registerUser, loginUser, updateUserProfile, getUserProfile, registerOwner } from "../controllers/userController"
import { verifyToken } from "../middleware/authorization"
import { verifyAddUser, verifyEditUser, verifyAuthentication } from "../middleware/userValidation"
import uploadFile from "../middleware/userUpload"

const app = express()
app.use(express.json())

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register new user
 */
app.post("/register", [verifyAddUser, uploadFile.single("profile_picture")], registerUser)

/**
 * @swagger
 * /users/registerOwner:
 *   post:
 *     summary: Register new owner
 */
app.post("/registerOwner", [verifyAddUser, uploadFile.single("profile_picture")], registerOwner)

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 */
app.post("/login", [verifyAuthentication], loginUser)

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 */
app.get("/profile", [verifyToken], getUserProfile)

/**
 * @swagger
 * /users/profile/{id}:
 *   put:
 *     summary: Update user profile (owner only)
 */
app.put("/profile/:id", [verifyToken, verifyEditUser, uploadFile.single("profile_picture")], updateUserProfile)

export default app
