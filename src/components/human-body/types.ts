export interface BodyViewProps {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
    style: { fillOpacity: number }
  }
  isRegionSelected: (aliases: string[]) => boolean
  handleRegionClick: (aliases: string[]) => void
  hasMuscleData: (aliases: string[]) => boolean
}

export type MuscleGroupProps = {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
    style: { fillOpacity: number }
  }
}
