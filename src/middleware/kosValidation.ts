import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema for creating kos */
const createKosSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  price_per_month: Joi.number().positive().required(),
  gender: Joi.string().valid("MALE", "FEMALE", "ALL").optional(),
  user: Joi.optional(),
})

/** create schema for updating kos */
const updateKosSchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  price_per_month: Joi.number().positive().optional(),
  gender: Joi.string().valid("MALE", "FEMALE", "ALL").optional(),
  user: Joi.optional(),
})

export const verifyCreateKos = (request: Request, response: Response, next: NextFunction) => {
  const { error } = createKosSchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyUpdateKos = (request: Request, response: Response, next: NextFunction) => {
  const { error } = updateKosSchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
