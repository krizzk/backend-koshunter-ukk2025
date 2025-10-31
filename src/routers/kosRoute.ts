import express from "express"
import { getAllKos, createKos, updateKos, deleteKos, getKosById } from "../controllers/kosController"
import { verifyCreateKos, verifyUpdateKos } from "../middleware/kosValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"
import uploadFile from "../middleware/kosUpload"
import uploadKosFile from "../middleware/kosUpload"
import { addKosImage, deleteKosImage } from "../controllers/kosImageController"



const app = express()
app.use(express.json())

// Society dan Owner dapat melihat daftar kos
app.get(`/`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getAllKos)
app.get(`/:id`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getKosById)

// Hanya Owner yang dapat membuat, update, dan delete kos
app.post(`/create`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("kos_picture"), verifyCreateKos], createKos)
app.put(`/update/:id`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("kos_picture"), verifyUpdateKos], updateKos)
app.delete(`/delete/:id`, [verifyToken, verifyRole(["OWNER"])], deleteKos)



/**
 * @swagger
 * /kos-images:
 *   post:
 *     summary: Add image to kos (owner only)
 */
app.post("/image/:kos_id", [verifyToken, verifyRole(["OWNER"]), uploadKosFile.single("file")], addKosImage)

/**
 * @swagger
 * /kos-images/{id}:
 *   delete:
 *     summary: Delete kos image (owner only)
 */
app.delete("/delete_image/:id", [verifyToken, verifyRole(["OWNER"])], deleteKosImage)

export default app
