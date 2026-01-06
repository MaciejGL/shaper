export interface FeaturedTrainerCardProps {
  name: string
  headline: string
  imageUrl?: string | null
  rating?: number
  reviews?: number
  years?: number
  clients?: number
  spots?: number | null
  onClick?: () => void
  onCTAClick?: () => void
}


