/**
 * Unselectable parts of the male front body - head
 * These are non-interactive elements that form the silhouette but aren't muscle groups
 */
export function Unselectable() {
  const fillClass = 'fill-[#424747]'

  return (
    <>
      {/* Head */}
      <path
        d="M77.826 16.3968C77.8366 6.45782 80.9029 2.60436 90.5221 0.441695C94.5237 -0.459002 101.691 0.0649453 106.184 1.58482C112.407 3.69112 115.06 8.15901 115.047 16.5192C115.039 22.766 114.151 30.4491 111.663 31.6311C109.07 32.8615 108.083 28.9317 105.493 33.6893C104.047 36.3477 104.814 36.1416 96.3867 36.1416C87.7364 36.1416 88.6965 36.4996 86.5833 32.4872C84.8879 29.2673 84.0182 32.6437 81.7735 31.6311C79.2198 30.4798 77.8176 23.1923 77.826 16.3968Z"
        className={fillClass}
        name="head"
      />
    </>
  )
}
