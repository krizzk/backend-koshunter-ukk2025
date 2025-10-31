import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema for creating facility */
const createFacilitySchema = Joi.object({
  facility: Joi.string().required(),
  user: Joi.optional(),
})

/** create schema for updating facility */
const updateFacilitySchema = Joi.object({
  facility: Joi.string().optional(),
  user: Joi.optional(),
})

export const verifyCreateFacility = (request: Request, response: Response, next: NextFunction) => {
  const { error } = createFacilitySchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyUpdateFacility = (request: Request, response: Response, next: NextFunction) => {
  const { error } = updateFacilitySchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
