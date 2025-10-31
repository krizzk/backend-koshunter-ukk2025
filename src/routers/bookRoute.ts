import express from "express"
import {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  getTransactionHistory,
  printBookingReceipt,
} from "../controllers/bookController"
import { verifyToken, verifyRole } from "../middleware/authorization"
import { verifyCreateBook, verifyUpdateBookStatus } from "../middleware/bookValidation"

const app = express()
app.use(express.json())

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create booking (society only)
 */
app.post("/", [verifyToken, verifyRole(["SOCIETY"]), verifyCreateBook], createBooking)

/**
 * @swagger
 * /books/user:
 *   get:
 *     summary: Get user bookings
 */
app.get("/user", [verifyToken], getUserBookings)

/**
 * @swagger
 * /books/owner:
 *   get:
 *     summary: Get owner's bookings
 */
app.get("/owner", [verifyToken, verifyRole(["OWNER"])], getOwnerBookings)

/**
 * @swagger
 * /books/{id}/status:
 *   put:
 *     summary: Update booking status (owner only)
 */
app.put("/:id/status", [verifyToken, verifyRole(["OWNER"]), verifyUpdateBookStatus], updateBookingStatus)

/**
 * @swagger
 * /books/history:
 *   get:
 *     summary: Get transaction history (owner only)
 */
app.get("/history", [verifyToken, verifyRole(["OWNER"])], getTransactionHistory)

/**
 * @swagger
 * /books/{id}/print:
 *   get:
 *     summary: Print booking receipt
 */
app.get("/:id/print", [verifyToken], printBookingReceipt)

export default app
