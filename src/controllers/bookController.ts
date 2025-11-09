import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"
import { BASE_URL } from "../global"
import "../types"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Create booking (society only)
export const createBooking = async (request: Request, response: Response) => {
  try {
    const { kos_id, start_date, end_date } = request.body
    const user_id = request.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const kos = await prisma.kos.findUnique({
      where: { id: Number(kos_id) },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    // Calculate total price
    const start = new Date(start_date)
    const end = new Date(end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const total_price = kos.price_per_month * days

    const booking = await prisma.book.create({
      data: {
        kos_id: Number(kos_id),
        user_id: Number(user_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: "PENDING",
      },
      include: {
        kos: true,
        user: true,
      },
    })

    return response.status(201).json({
      status: true,
      data: booking,
      message: "Booking created successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get user bookings
export const getUserBookings = async (request: Request, response: Response) => {
  try {
    const { user_id } = request.params

    if (!user_id) {
      return response.status(400).json({
        status: false,
        message: "User id is required",
      })
    }

    const bookings = await prisma.book.findMany({
      where: { user_id: Number(user_id) },
      include: {
        kos: {
          include: {
            images: true, // sesuaikan nama relasi jika berbeda (mis. images)
          },
        },
        user: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: bookings,
      message: "Bookings retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get bookings for owner's kos
export const getOwnerBookings = async (request: Request, response: Response) => {
  try {
    const user_id = request.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const bookings = await prisma.book.findMany({
      where: {
        kos: {
          user_id: Number(user_id),
        },
      },
      include: {
        kos: {
          include: {
            images: true, // sesuaikan nama relasi jika berbeda (mis. images)
          },
        },
        user: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: bookings,
      message: "Owner bookings retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Update booking status (owner only)
export const updateBookingStatus = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { status } = request.body
    const user_id = request.user?.id

    const booking = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!booking) {
      return response.status(404).json({
        status: false,
        message: "Booking not found",
      })
    }

    if (booking.kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    const updatedBooking = await prisma.book.update({
      where: { id: Number(id) },
      data: { status },
      include: {
        kos: true,
        user: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: updatedBooking,
      message: "Booking status updated successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get transaction history by date/month (owner only)
export const getTransactionHistory = async (request: Request, response: Response) => {
  try {
    const user_id = request.user?.id
    const { month, year } = request.query

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const where: any = {
      kos: {
        user_id: Number(user_id),
      },
    }

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1)
      const endDate = new Date(Number(year), Number(month), 0)

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.book.findMany({
      where,
      include: {
        kos: true,
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return response.status(200).json({
      status: true,
      data: transactions,
      message: "Transaction history retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Print booking receipt
export const printBookingReceipt = async (request: Request, response: Response) => {
  try {
    const { id } = request.params

    const booking = await prisma.book.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
        user: true,
      },
    })

    if (!booking) {
      return response.status(404).json({
        status: false,
        message: "Booking not found",
      })
    }

    // Calculate total price
    const start = new Date(booking.start_date)
    const end = new Date(booking.end_date)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate() // gets actual days in the month
    const dailyRate = booking.kos.price_per_month / daysInMonth
    const total_price = Math.ceil(dailyRate * days)

    // Create PDF
    const doc = new PDFDocument()
    const filename = `receipt_${booking.id}_${Date.now()}.pdf`
    const filepath = path.join(BASE_URL, "..", "public", "receipts", filename)

    // Ensure directory exists
    const dir = path.dirname(filepath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const stream = fs.createWriteStream(filepath)
    doc.pipe(stream)

    // Add content
    doc.fontSize(20).text("BOOKING RECEIPT", { align: "center" })
    doc.text(`========================================`)
    doc.moveDown()
    
    doc.fontSize(12).text(`Booking ID: ${booking.id}`, { align: "left" })
    doc.text(`Date: ${new Date().toLocaleDateString()}`)
    doc.moveDown()

    doc.text("GUEST INFORMATION", { underline: true })
    doc.text(`Name: ${booking.user.name}`)
    doc.text(`Email: ${booking.user.email}`)
    doc.text(`Phone: ${booking.user.phone}`)
    doc.moveDown()

    doc.text("KOS INFORMATION", { underline: true })
    doc.text(`Kos Name: ${booking.kos.name}`)
    doc.text(`Address: ${booking.kos.address}`)
    doc.text(`Gender: ${booking.kos.gender}`)
    doc.moveDown()

    doc.text("BOOKING DETAILS", { underline: true })
    doc.text(`Check-in: ${booking.start_date.toLocaleDateString()}`)
    doc.text(`Check-out: ${booking.end_date.toLocaleDateString()}`)
    doc.text(`Duration: ${days} days`)
    doc.text(`Price per Month: Rp ${booking.kos.price_per_month.toLocaleString("id-ID")}`)
    doc.font("Helvetica-Bold").text(`Total Price: Rp ${total_price.toLocaleString("id-ID")}`)
    doc.font("Helvetica")
    doc.moveDown()

    doc.text(`Status: ${booking.status} `)
    doc.moveDown()

    doc.fontSize(10).text("Thank you for booking with us!<3<3", { align: "center" })

    doc.end()

    stream.on("finish", () => {
      response.download(filepath, filename, (err) => {
        if (err) {
          console.error("Error downloading file:", err)
        }
        // Optionally delete file after download
        fs.unlink(filepath, (err) => {
          if (err) console.error("Error deleting file:", err)
        })
      })
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
