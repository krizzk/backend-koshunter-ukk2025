import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Get facilities for a kos
export const getKosFacilities = async (request: Request, response: Response) => {
  try {
    const { kos_id } = request.params

    const facilities = await prisma.kosFacility.findMany({
      where: { kos_id: Number(kos_id) },
    })

    return response.status(200).json({
      status: true,
      data: facilities,
      message: "Facilities retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Add facility to kos
export const addKosFacility = async (request: Request, response: Response) => {
  try {
    const kos_id = Number(request.params.kos_id)
    const { facility } = request.body
    const user_id = request.user?.id

    // Check if kos exists and belongs to user
    const kos = await prisma.kos.findUnique({
      where: { id: Number(kos_id) },
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

    const newFacility = await prisma.kosFacility.create({
      data: {
        kos_id: Number(kos_id),
        facility,
      },
    })

    return response.status(201).json({
      status: true,
      data: newFacility,
      message: "Facility added successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Update facility
export const updateKosFacility = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { facility } = request.body
    const user_id = request.user?.id

    const facilityData = await prisma.kosFacility.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!facilityData) {
      return response.status(404).json({
        status: false,
        message: "Facility not found",
      })
    }

    if (facilityData.kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    const updatedFacility = await prisma.kosFacility.update({
      where: { id: Number(id) },
      data: { facility },
    })

    return response.status(200).json({
      status: true,
      data: updatedFacility,
      message: "Facility updated successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Delete facility
export const deleteKosFacility = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user_id = request.user?.id

    const facilityData = await prisma.kosFacility.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!facilityData) {
      return response.status(404).json({
        status: false,
        message: "Facility not found",
      })
    }

    if (facilityData.kos.user_id !== Number(user_id)) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    await prisma.kosFacility.delete({
      where: { id: Number(id) },
    })

    return response.status(200).json({
      status: true,
      message: "Facility deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
