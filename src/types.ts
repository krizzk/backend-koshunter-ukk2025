declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        name: string
        email: string
        role: "OWNER" | "SOCIETY" | "ADMIN"
        phone: string
        profile_picture?: string | null
      }
    }
  }
}

export interface UserData {
  id: number
  name: string
  email: string
  phone: string
  role: "OWNER" | "SOCIETY" | "ADMIN"
  profile_picture?: string | null
}

export interface KosData {
  id: number
  user_id: number
  name: string
  address: string
  price_per_month: number
  gender: "MALE" | "FEMALE" | "ALL"
}

export interface KosImageData {
  id: number
  kos_id: number
  file: string
}

export interface KosFacilityData {
  id: number
  kos_id: number
  facility: string
}

export interface ReviewData {
  id: number
  kos_id: number
  user_id: number
  comment: string
  reply?: string
}

export interface BookData {
  id: number
  kos_id: number
  user_id: number
  start_date: Date
  end_date: Date
  status: "PENDING" | "ACCEPT" | "REJECT"
}

