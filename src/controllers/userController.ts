import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import md5 from "md5"
import { sign } from "jsonwebtoken"
import { SECRET } from "../global"

const prisma = new PrismaClient({ errorFormat: "pretty" })

// Register user
export const registerUser = async (request: Request, response: Response) => {
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
        role: role || "SOCIETY",
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

export const registerOwner = async (request: Request, response: Response) => {
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
        role: role || "OWNER",
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

// Login user
export const loginUser = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || user.password !== md5(password)) {
      return response.status(401).json({
        status: false,
        message: "Invalid email or password",
      })
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile_picture: user.profile_picture,
    }

    const token = sign(payload, SECRET || "joss")

    return response.status(200).json({
      status: true,
      data: payload,
      token,
      message: "Login successful",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Update user profile (owner only)
export const updateUserProfile = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { name, phone } = request.body
    const user_id = request.body.user?.id

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) }
    });

    if (!existingUser) {
      return response.status(404).json({
        status: false,
        message: `Profile with id ${id} not found`
      });
    }

    // if (Number(id) !== user_id) {
    //   return response.status(403).json({
    //     status: false,
    //     message: "Forbidden - You can only edit your own profile"
    //   });
    // }


    const profile_picture = request.file ? `/uploads/profile_picture/${request.file.filename}` : undefined

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        profile_picture: profile_picture || undefined,
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

    return response.status(200).json({
      status: true,
      data: user,
      message: "Profile updated successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}

// Get user profile
export const getUserProfile = async (request: Request, response: Response) => {
  try {
    const user_id = request.body.user?.id

    if (!user_id) {
      return response.status(401).json({
        status: false,
        message: "Unauthorized",
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        profile_picture: true,
      },
    })

    return response.status(200).json({
      status: true,
      data: user,
      message: "Profile retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `Error: ${error}`,
    })
  }
}
