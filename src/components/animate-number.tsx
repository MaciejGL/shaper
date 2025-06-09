import NumberFlow, {
  NumberFlowGroup,
  NumberFlowProps,
  continuous,
} from '@number-flow/react'

import { cn } from '@/lib/utils'

const formatTypes = {
  // currency: {
  //   style: 'currency',
  //   currency: 'NOK',
  //   maximumFractionDigits: 0,
  // },
  percent: {
    style: 'percent',
    maximumFractionDigits: 1,
    trailingZeroDisplay: 'stripIfInteger',
  },
} as const

type AnimateNumberFormatType = keyof typeof formatTypes

export type AnimateNumberFormat =
  | AnimateNumberFormatType
  | NumberFlowProps['format']

export function AnimateNumber({
  isPending = false,
  format,
  className,
  ...rest
}: NumberFlowProps & {
  isPending?: boolean
  format?: AnimateNumberFormatType
}) {
  return (
    <NumberFlow
      className={cn({ 'masked-placeholder-text': isPending }, className)}
      format={{
        ...(format ? formatTypes[format as AnimateNumberFormatType] : {}),
        notation: 'standard',
      }}
      transformTiming={{
        duration: 1000,
        easing: 'ease-in-out',
      }}
      plugins={[continuous]}
      {...rest}
    />
  )
}

export const AnimateNumberGroup = NumberFlowGroup
