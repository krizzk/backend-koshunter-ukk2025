// import express from "express"
// import { addKosImage, deleteKosImage } from "../controllers/kosImageController"
// import { verifyToken, verifyRole } from "../middleware/authorization"
// import uploadKosFile from "../middleware/kosUpload"

// const app = express()
// app.use(express.json())

// /**
//  * @swagger
//  * /kos-images:
//  *   post:
//  *     summary: Add image to kos (owner only)
//  */
// app.post("/:kos_id", [verifyToken, verifyRole(["OWNER"]), uploadKosFile.single("file")], addKosImage)

// /**
//  * @swagger
//  * /kos-images/{id}:
//  *   delete:
//  *     summary: Delete kos image (owner only)
//  */
// app.delete("/:id", [verifyToken, verifyRole(["OWNER"])], deleteKosImage)

// export default app
