import { MeasurementBodyMapDisplay } from './measurement-body-map/measurement-body-map-display'

export function DetailedMeasurements({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="mt-12 mb-18">
        <MeasurementBodyMapDisplay />
      </div>
    </div>
  )
}
