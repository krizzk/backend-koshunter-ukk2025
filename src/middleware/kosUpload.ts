import type { Request } from "express"
import multer from "multer"
import { BASE_URL } from "../global"
import type { Express } from "express"

/** define storage configuration for kos images */
const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    /** define location of uploaded kos images */
    cb(null, `${BASE_URL}/public/kos_picture/`)
  },
  filename: (request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    /** define file name of uploaded file */
    cb(null, `${new Date().getTime().toString()}-${file.originalname}`)
  },
})

const uploadKosFile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } /** max size is 5 MB */,
})

export default uploadKosFile
