import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export type { Config }

const config: Partial<Config> = {
  theme: {
    extend: {
      // backgroundColor: backgrounds,
      // fill: backgrounds,
      // stroke,
      // borderColor: stroke,
      // ringColor: stroke,
      // outlineColor: stroke,
      // divideColor: stroke,
      // textDecorationColor: stroke,

      colors: {},

      borderRadius: {
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
      },
      textUnderlineOffset: {
        3: '3px',
        6: '6px',
      },

      listStyleImage: {
        dot: `url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="13.5504" r="1.6" fill="%23141E29"/></svg>')`,
        'dot-gold': `url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="13.5504" r="3" fill="%23D7B180"/></svg>')`,
      },
    },
  },
  plugins: [
    plugin(({ addBase, addVariant, addUtilities }) => {
      addUtilities({
        '.flex-center': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.hide-scrollbar': {
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })

      addVariant('not-last', '&:not(:last-child)')
      addVariant('not-first', '&:not(:first-child)')
      addVariant('hover', '&:is(:hover, [data-state=hover])')
      addVariant('focus-visible', '&:is(:focus-visible, [data-state=focus])')
      addVariant('pressed', '&:is(:active, [data-state=pressed])')
      addVariant('disabled', '&:is(:disabled, [data-state=disabled])')
      addVariant('hover-supported', '@media (hover: hover)')
    }),
  ],
}

export default config
