import { MeasurementBodyMapDisplay } from './measurement-body-map/measurement-body-map-display'

export function DetailedMeasurements({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="font-semibold mb-2">Body Circumferences</div>
      <MeasurementBodyMapDisplay />
    </div>
  )
}
