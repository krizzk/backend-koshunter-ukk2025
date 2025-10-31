import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import "../types"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get all kos with optional gender filter
export const getAllKos = async (request: Request, response: Response) => {
  try {
    const { gender } = request.query

    const where: any = {}
    if (gender) {
      where.gender = gender.toString().toUpperCase()
    }

    const kos = await prisma.kos.findMany({
      where,
      include: {
        images: true,
        facilities: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    return response.status(200).json({
      status: true,
      data: kos,
      message: "Kos list retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get kos by ID
export const getKosById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params

    const kos = await prisma.kos.findUnique({
      where: { id: Number(id) },
      include: {
        images: true,
        facilities: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    return response.status(200).json({
      status: true,
      data: kos,
      message: "Kos retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Create kos (owner only)
export const createKos = async (request: Request, response: Response) => {
  try {
    const { name, address, price_per_month, gender } = request.body
    const user_id = request.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const kos = await prisma.kos.create({
      data: {
        user_id: Number(user_id),
        name,
        address,
        price_per_month: Number(price_per_month),
        gender: gender || "ALL",
      },
      include: {
        images: true,
        facilities: true,
      },
    })

    return response.status(201).json({
      status: true,
      data: kos,
      message: "Kos created successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Update kos (owner only)
export const updateKos = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { name, address, price_per_month, gender } = request.body
    const user_id = request.user?.id

    // Check if kos exists and belongs to user
    const kos = await prisma.kos.findUnique({
      where: { id: Number(id) },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    if (kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    const updatedKos = await prisma.kos.update({
      where: { id: Number(id) },
      data: {
        name: name || kos.name,
        address: address || kos.address,
        price_per_month: price_per_month ? Number(price_per_month) : kos.price_per_month,
        gender: gender || kos.gender,
      },
      include: {
        images: true,
        facilities: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: updatedKos,
      message: "Kos updated successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Delete kos (owner only)
export const deleteKos = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user_id = request.user?.id

    // Check if kos exists and belongs to user
    const kos = await prisma.kos.findUnique({
      where: { id: Number(id) },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    if (kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    await prisma.kos.delete({
      where: { id: Number(id) },
    })

    return response.status(200).json({
      status: true,
      message: "Kos deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get owner's kos
export const getOwnerKos = async (request: Request, response: Response) => {
  try {
    const user_id = request.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const kos = await prisma.kos.findMany({
      where: { user_id: Number(user_id) },
      include: {
        images: true,
        facilities: true,
        reviews: true,
        books: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: kos,
      message: "Owner kos retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
