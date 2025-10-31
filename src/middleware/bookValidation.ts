import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema for creating booking */
const createBookSchema = Joi.object({
  kos_id: Joi.number().positive().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  user: Joi.optional(),
})

/** create schema for updating booking status */
const updateBookStatusSchema = Joi.object({
  status: Joi.string().valid("PENDING", "ACCEPT", "REJECT").required(),
  user: Joi.optional(),
})

export const verifyCreateBook = (request: Request, response: Response, next: NextFunction) => {
  const { error } = createBookSchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyUpdateBookStatus = (request: Request, response: Response, next: NextFunction) => {
  const { error } = updateBookStatusSchema.validate(request.body, { abortEarly: false })

  if (error) {
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
