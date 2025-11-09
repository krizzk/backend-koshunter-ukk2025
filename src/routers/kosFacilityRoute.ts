import express from "express"
import {
  getKosFacilities,
  addKosFacility,
  updateKosFacility,
  deleteKosFacility,
} from "../controllers/kosFacilityController"
import { verifyToken, verifyRole } from "../middleware/authorization"
import { verifyCreateFacility, verifyUpdateFacility } from "../middleware/kosFacilityValidation"

const app = express()
app.use(express.json())

/**
 * @swagger
 * /kos-facilities/{kos_id}:
 *   get:
 *     summary: Get facilities for a kos
 */
app.get("/:kos_id", getKosFacilities)

/**
 * @swagger
 * /kos-facilities:
 *   post:
 *     summary: Add facility to kos (owner only)
 */
app.post("/:kos_id", [verifyToken, verifyRole(["OWNER"]), verifyCreateFacility], addKosFacility)

/**
 * @swagger
 * /kos-facilities/{id}:
 *   put:
 *     summary: Update facility (owner only)
 */
app.put("/:id", [verifyToken, verifyRole(["OWNER"]), verifyUpdateFacility], updateKosFacility)

/**
 * @swagger
 * /kos-facilities/{id}:
 *   delete:
 *     summary: Delete facility (owner only)
 */
app.delete("/delete/:id", [verifyToken, verifyRole(["OWNER"])], deleteKosFacility)

export default app
