import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get reviews for a kos
export const getKosReviews = async (request: Request, response: Response) => {
  try {
    const { kos_id } = request.params

    const reviews = await prisma.review.findMany({
      where: { kos_id: Number(kos_id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return response.status(200).json({
      status: true,
      data: reviews,
      message: "Reviews retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Add review (society only)
export const addReview = async (request: Request, response: Response) => {
  try {
    const kos_id = Number(request.params.kos_id)
    const { comment, bintang } = request.body
    const user_id = request.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const review = await prisma.review.create({
      data: {
        kos_id: Number(kos_id),
        user_id: Number(user_id),
        bintang: Number(bintang),
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return response.status(201).json({
      status: true,
      data: review,
      message: "Review added successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Reply to review (owner only)
export const replyReview = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { reply } = request.body
    const user_id = request.user?.id

    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!review) {
      return response.status(404).json({
        status: false,
        message: "Review not found",
      })
    }

    if (review.kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: { reply },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return response.status(200).json({
      status: true,
      data: updatedReview,
      message: "Reply added successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Delete review
export const deleteReview = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user_id = request.user?.id

    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
    })

    if (!review) {
      return response.status(404).json({
        status: false,
        message: "Review not found",
      })
    }

    if (review.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    await prisma.review.delete({
      where: { id: Number(id) },
    })

    return response.status(200).json({
      status: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
