import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

// Schema for updating user by admin
const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(10).optional(),
  role: Joi.string().valid("OWNER", "SOCIETY", "ADMIN").uppercase().optional(),
  profile_picture: Joi.allow().optional(),
})

export const verifyUpdateUser = (request: Request, response: Response, next: NextFunction) => {
  const { error } = updateUserSchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(", "),
    })
  }
  return next()
}
