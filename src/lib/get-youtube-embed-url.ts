export function getYouTubeEmbedUrl(
  url: string,
  {
    autoplay,
    mute,
    loop,
    minimal = true, // New option to enable minimal player
  }:
    | {
        autoplay?: boolean
        mute?: boolean
        loop?: boolean
        minimal?: boolean
      }
    | undefined = {
    autoplay: false,
    mute: true,
    loop: false,
    minimal: true,
  },
) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  )

  if (!match) return url

  const videoId = match[1]
  const autoplayValue = autoplay ? 1 : 0
  const muteValue = mute ? 1 : 0
  const loopValue = loop ? 1 : 0

  // For YouTube loop to work, we need both loop=1 and playlist=videoId
  const loopParams = loop ? `&loop=${loopValue}&playlist=${videoId}` : ''

  // Minimal player parameters to remove suggestions and branding
  const minimalParams = minimal
    ? '&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&showinfo=0&controls=0&disablekb=1&playsinline=1&start=1'
    : ''

  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayValue}&mute=${muteValue}${loopParams}${minimalParams}`
}
