import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import md5 from "md5"

const prisma = new PrismaClient()

// Get all users
export const getAllUsers = async (request: Request, response: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return response.status(200).json({
      status: true,
      message: "Users retrieved successfully",
      data: users,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return response.status(500).json({
      status: false,
      message: `Failed to retrieve users: ${errorMessage}`,
    })
  }
}

export const registerAdmin = async (request: Request, response: Response) => {
  try {
    const { name, email, password, phone, role } = request.body
    const profile_picture = request.file ? `/uploads/profile_picture/${request.file.filename}` : null

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return response.status(400).json({
        status: false,
        message: "Email already registered",
      })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: md5(password),
        phone,
        role: role || "ADMIN",
        profile_picture,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
      },
    })

    return response.status(201).json({
      status: true,
      data: user,
      message: "User registered successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get user by ID
export const getUserById = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const userId = Number(id)

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return response.status(404).json({
        status: false,
        message: "User not found",
      })
    }

    return response.status(200).json({
      status: true,
      message: "User retrieved successfully",
      data: user,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return response.status(500).json({
      status: false,
      message: `Failed to retrieve user: ${errorMessage}`,
    })
  }
}

// Update user
export const updateUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const userId = Number(id)
    const { name, email, phone, role } = request.body
    const admin_id = request.user?.id

    if (request.user?.role !== "ADMIN") {
      return response.status(403).json({
        status: false,
        message: "Forbidden: Only admins can update users",
      })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return response.status(404).json({
        status: false,
        message: "User not found",
      })
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return response.status(400).json({
          status: false,
          message: "Email already in use",
        })
      }
    }

    // Handle profile picture upload
    let profilePicturePath = existingUser.profile_picture

    if (request.file) {
      // Delete old profile picture if exists
      if (existingUser.profile_picture) {
        const oldFilePath = path.join(process.cwd(), "public", existingUser.profile_picture)
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath)
        }
      }

      profilePicturePath = `/profile_picture/${request.file.filename}`
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(profilePicturePath && { profile_picture: profilePicturePath }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
        updatedAt: true,
      },
    })

    return response.status(200).json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return response.status(500).json({
      status: false,
      message: `Failed to update user: ${errorMessage}`,
    })
  }
}

// Delete user
export const deleteUser = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const userId = Number(id)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return response.status(404).json({
        status: false,
        message: "User not found",
      })
    }

    // Delete profile picture if exists
    if (user.profile_picture) {
      const filePath = path.join(process.cwd(), "public", user.profile_picture)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    // Delete user (cascade delete will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    })

    return response.status(200).json({
      status: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return response.status(500).json({
      status: false,
      message: `Failed to delete user: ${errorMessage}`,
    })
  }
}

// Get users by role
export const getUsersByRole = async (request: Request, response: Response) => {
  try {
    const { role } = request.params

    const validRoles = ["OWNER", "SOCIETY", "ADMIN"]
    if (!validRoles.includes(role.toUpperCase())) {
      return response.status(400).json({
        status: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      })
    }

    const users = await prisma.user.findMany({
      where: {
        role: role.toUpperCase() as 'OWNER' | 'SOCIETY' | 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return response.status(200).json({
      status: true,
      message: `${role.toUpperCase()} users retrieved successfully`,
      data: users,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return response.status(500).json({
      status: false,
      message: `Failed to retrieve users: ${errorMessage}`,
    })
  }
}
