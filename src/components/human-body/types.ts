export interface BodyViewProps {
  className?: string
  getPathProps?: (aliases: string[]) => {
    className: string
    onClick: () => void
  }
}

export type MuscleGroupProps = {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
  }
}
