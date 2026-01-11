const { withAndroidManifest } = require('@expo/config-plugins')

function withRequiredTelephony(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest

    const usesFeature = manifest['uses-feature'] ?? []
    const hasTelephony = usesFeature.some(
      (f) => f?.$?.['android:name'] === 'android.hardware.telephony',
    )

    if (!hasTelephony) {
      usesFeature.push({
        $: {
          'android:name': 'android.hardware.telephony',
          'android:required': 'true',
        },
      })
      manifest['uses-feature'] = usesFeature
    }

    return config
  })
}

module.exports = withRequiredTelephony

