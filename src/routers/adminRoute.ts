/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin user management endpoints
 */

import express from "express"
import { verifyToken, verifyRole } from "../middleware/authorization"
import { verifyUpdateUser } from "../middleware/adminValidation"
import uploadFile, { userUpload } from "../middleware/userUpload"
import { getAllUsers, getUserById, updateUser, deleteUser, getUsersByRole, registerAdmin } from "../controllers/adminController"
import { verifyAddUser } from "../middleware/userValidation"

const app = express.Router()
app.use(express.json())


app.post("/register", [verifyAddUser, uploadFile.single("profile_picture")], registerAdmin)


/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         description: Access denied - Admin role required
 */
app.get("/users", verifyToken, verifyRole(["ADMIN"]), getAllUsers)

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
app.get("/users/:id", verifyToken, verifyRole(["ADMIN"]), getUserById)

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [OWNER, SOCIETY, ADMIN]
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.put(
  "/users/:id",
  verifyToken,
  verifyRole(["ADMIN"]),
  userUpload.single("profile_picture"),
  verifyUpdateUser,
  updateUser,
)

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
app.delete("/users/:id", verifyToken, verifyRole(["ADMIN"]), deleteUser)

/**
 * @swagger
 * /admin/users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [OWNER, SOCIETY, ADMIN]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid role
 */
app.get("/users/role/:role", verifyToken, verifyRole(["ADMIN"]), getUsersByRole)

export default app
