import { ReactNode } from 'react'

interface SmoothGradientProps {
  variant?: 'mockup' | 'feature' | 'orb'
  index?: number
  className?: string
  children?: ReactNode
  intensity?: 'low' | 'medium' | 'high'
  colors?: {
    primary: string
    secondary: string
    accent?: string
  }
}

export function SmoothGradient({
  variant = 'mockup',
  index = 0,
  className = '',
  children,
  intensity = 'medium',
  colors = {
    primary: 'rgba(47, 109, 209, 0.428)',
    secondary: 'rgba(139, 92, 246, 0.08)',
    accent: 'rgba(99, 102, 241, 0.06)',
  },
}: SmoothGradientProps) {
  // Opacity values based on intensity
  const opacityMap = {
    low: { base: 0.4, hover: 0.6 },
    medium: { base: 0.6, hover: 0.8 },
    high: { base: 0.8, hover: 1.0 },
  }

  const { base, hover } = opacityMap[intensity]

  // Different gradient configurations for different use cases
  const gradientConfigs = {
    mockup: {
      containerClass: `absolute inset-0 rounded-full opacity-${Math.round(base * 100)} md:opacity-0 md:group-hover:opacity-${Math.round(hover * 100)} transition-opacity duration-700`,
      layers: [
        {
          position: 'ellipse at 20% 50%',
          colors: [
            colors.primary,
            colors.secondary.replace('0.08', '0.06'),
            'transparent',
          ],
          stops: ['0%', '30%', '70%'],
          blur: 'blur(60px)',
        },
        {
          position: 'ellipse at 80% 30%',
          colors: [
            colors.secondary,
            colors.primary.replace('0.12', '0.06'),
            'transparent',
          ],
          stops: ['0%', '40%', '75%'],
          blur: 'blur(40px)',
        },
      ],
    },
    feature: {
      containerClass: `absolute inset-0 opacity-0 group-hover:opacity-${Math.round(hover * 100)} transition-opacity duration-700`,
      layers: [
        {
          position: 'circle at 60% 40%',
          colors: [
            colors.primary.replace('0.12', '0.08'),
            colors.secondary.replace('0.08', '0.04'),
            'transparent',
          ],
          stops: ['0%', '40%', '70%'],
          blur: 'blur(60px)',
          transform: `translate(${25 + Math.sin(index) * 20}%, ${25 + Math.cos(index) * 20}%)`,
          containerClass:
            'absolute -top-1/2 -left-1/2 w-full h-full rounded-full',
        },
        {
          position: 'circle at 40% 60%',
          colors: [
            colors.secondary.replace('0.08', '0.06'),
            colors.primary.replace('0.12', '0.03'),
            'transparent',
          ],
          stops: ['0%', '50%', '80%'],
          blur: 'blur(40px)',
          transform: `translate(${-25 + Math.cos(index) * 15}%, ${-25 + Math.sin(index) * 15}%)`,
          containerClass:
            'absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full',
        },
      ],
    },
    orb: {
      containerClass: `w-full h-full rounded-full`,
      layers: [
        {
          position: 'circle at 30% 40%',
          colors: [
            colors.primary,
            colors.secondary,
            colors.primary.replace('0.428', '0.05'),
            'transparent',
          ],
          stops: ['0%', '25%', '50%', '80%'],
          blur: variant === 'orb' ? 'blur(40px)' : 'blur(30px)',
        },
      ],
    },
  }

  const config = gradientConfigs[variant]

  const createGradient = (layer: any, layerIndex: number) => {
    const gradientColors = layer.colors
      .map(
        (color: string, colorIndex: number) =>
          `${color} ${layer.stops[colorIndex]}`,
      )
      .join(', ')

    return (
      <div
        key={layerIndex}
        className={layer.containerClass || 'absolute inset-0 rounded-full'}
        style={{
          background: `radial-gradient(${layer.position}, ${gradientColors})`,
          filter: layer.blur,
          transform: layer.transform,
        }}
      />
    )
  }

  return (
    <div className={`${config.containerClass} ${className}`}>
      {config.layers.map(createGradient)}
      {children}
    </div>
  )
}

// Preset variants for common use cases
export function MockupGradient({
  index = 0,
  colors,
}: {
  index?: number
  colors?: SmoothGradientProps['colors']
}) {
  return <SmoothGradient variant="mockup" index={index} colors={colors} />
}

export function FeatureGradient({ index = 0 }: { index?: number }) {
  return <SmoothGradient variant="feature" index={index} />
}

export function OrbGradient({
  size = 'medium',
  colors,
  className = '',
  style,
}: {
  size?: 'small' | 'medium' | 'large'
  colors?: SmoothGradientProps['colors']
  className?: string
  style?: React.CSSProperties
}) {
  const sizeMap = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  }

  return (
    <div className={`${sizeMap[size]} ${className}`} style={style}>
      <SmoothGradient variant="orb" colors={colors} />
    </div>
  )
}
