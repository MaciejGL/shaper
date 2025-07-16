# AWS S3 Setup for Image Uploads

This guide will help you set up AWS S3 for handling image uploads in your application.

## Prerequisites

- AWS Account
- Basic knowledge of AWS console

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click **"Create bucket"**
3. Choose a unique bucket name (e.g., `your-app-name-images`)
4. Select your preferred region (e.g., `us-east-1`)
5. **Important**: Uncheck "Block all public access" since we need public read access for images
6. Check the acknowledgment box
7. Click **"Create bucket"**

## Step 2: Configure Bucket CORS

1. Go to your bucket → **Permissions** tab
2. Scroll down to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and paste this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:4000", "https://your-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

4. Replace `https://your-domain.com` with your actual domain
5. Click **Save changes**

## Step 3: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **Users** → **Create user**
3. Enter username (e.g., `s3-image-upload-user`)
4. Select **Attach policies directly**
5. Click **Create policy** → **JSON** tab
6. Paste this policy (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

7. Name the policy (e.g., `S3ImageUploadPolicy`)
8. Create the policy and attach it to your user
9. Complete user creation

## Step 4: Generate Access Keys

1. Go to your user → **Security credentials** tab
2. Click **Create access key**
3. Select **Application running outside AWS**
4. Click **Next** → **Create access key**
5. **Important**: Save both the Access Key ID and Secret Access Key

## Step 5: Environment Variables

Add these variables to your `.env.local` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=eu-north-1
AWS_S3_BUCKET_NAME=fitspace-prod
```

## Step 6: Test the Setup

1. Restart your development server
2. Go to your profile page
3. Click edit mode
4. Try uploading an avatar image
5. The image should upload successfully and appear immediately

## Folder Structure

Your S3 bucket will organize images like this:

```
your-bucket/
├── avatars/
│   └── {userId}/
│       └── {timestamp}-{filename}
├── exercises/
│   └── {exerciseId}/
│       └── {timestamp}-{filename}
└── progress/
    └── {userId}/
        └── {timestamp}-{filename}
```

## Cost Estimation

For moderate usage (1000+ users):

- **Storage**: ~$0.023/GB/month
- **Requests**: ~$0.005/1000 uploads
- **Estimated monthly cost**: < $10

## Security Features

✅ **Presigned URLs**: 5-minute expiration  
✅ **File validation**: Type and size limits  
✅ **User authentication**: Required for uploads  
✅ **Automatic compression**: Optimizes file sizes

## Optional: CloudFront CDN

For faster image delivery worldwide:

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Create distribution with your S3 bucket as origin
3. Add this environment variable:

```env
AWS_CLOUDFRONT_DOMAIN=your-distribution.cloudfront.net
```

## Troubleshooting

### Upload fails with "Access Denied"

- Check IAM policy permissions
- Verify bucket CORS configuration
- Ensure bucket allows public read access

### Images don't appear after upload

- Check bucket public access settings
- Verify the public URL format in browser
- Check browser console for CORS errors

### "Bucket not found" error

- Verify bucket name in environment variables
- Check AWS region settings
- Ensure bucket exists in the specified region
