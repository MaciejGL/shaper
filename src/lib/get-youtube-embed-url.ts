export function getYouTubeEmbedUrl(
  url: string,
  { autoplay, mute }: { autoplay?: boolean; mute?: boolean } | undefined = {
    autoplay: false,
    mute: true,
  },
) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  )

  const autoplayValue = autoplay ? 1 : 0
  const muteValue = mute ? 1 : 0

  return match
    ? `https://www.youtube.com/embed/${match[1]}?autoplay=${autoplayValue}&mute=${muteValue}`
    : url
}
