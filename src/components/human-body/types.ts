export interface BodyViewProps {
  getPathProps: (aliases: string[]) => {
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
