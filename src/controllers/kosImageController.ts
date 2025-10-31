import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import { BASE_URL } from "../global"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Add image to kos
export const addKosImage = async (request: Request, response: Response) => {
  try {
    const kos_id = Number(request.params.kos_id)
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

    if (kos.user_id !== user_id) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    let filename = ""
    if (request.file) {
      filename = request.file.filename
    }

    const image = await prisma.kosImage.create({
      data: {
        kos_id: Number(kos_id),
        file: `/uploads/kos_picture/${filename}`,
      },
    })

    return response.status(201).json({
      status: true,
      data: image,
      message: "Image added successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Delete image
export const deleteKosImage = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user_id = request.body.user?.id

    const image = await prisma.kosImage.findUnique({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!image) {
      return response.status(404).json({
        status: false,
        message: "Image not found",
      })
    }

    if (image.kos.user_id !== user_id) {
      return response.status(403).json({
        status: false,
        message: "Forbidden",
      })
    }

    const filename = image.file.split("/").pop()
    const path = `${BASE_URL}/public/kos_picture/${filename}`
    const exists = fs.existsSync(path)
    if (exists && filename !== "") fs.unlinkSync(path)

    await prisma.kosImage.delete({
      where: { id: Number(id) },
    })

    return response.status(200).json({
      status: true,
      message: "Image deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
