export interface BodyViewProps {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
  }
  isRegionSelected: (aliases: string[]) => boolean
  handleRegionClick: (aliases: string[]) => void
  hasMuscleData?: (aliases: string[]) => boolean
  hideLabels?: boolean
}

export type MuscleGroupProps = {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
  }
}
