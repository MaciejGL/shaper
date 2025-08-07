const webpush = require('web-push')

// Generate VAPID keys for web push notifications
const vapidKeys = webpush.generateVAPIDKeys()

console.log('Copy these keys to your .env file:')
console.log('')
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`)
console.log(`NEXT_PUBLIC_VAPID_SUBJECT="mailto:your-email@example.com"`)
console.log('')
console.log('⚠️  Remember to replace the email with your actual email address!')
