import express from "express"
import { getKosReviews, addReview, replyReview, deleteReview } from "../controllers/reviewController"
import { verifyToken, verifyRole } from "../middleware/authorization"
import { verifyAddReview, verifyReplyReview } from "../middleware/reviewValidation"

const app = express()
app.use(express.json())

/**
 * @swagger
 * /reviews/{kos_id}:
 *   get:
 *     summary: Get reviews for a kos
 */
app.get("/:kos_id", getKosReviews)

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Add review (society only)
 */
app.post("/:kos_id", [verifyToken, verifyRole(["SOCIETY"]),verifyAddReview], addReview)

/**
 * @swagger
 * /reviews/{id}/reply:
 *   put:
 *     summary: Reply to review (owner only)
 */
app.put("/:id/reply", [verifyToken, verifyRole(["OWNER"]),verifyReplyReview], replyReview)

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete review
 */
app.delete("/:id", [verifyToken], deleteReview)

export default app
