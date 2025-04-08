# Google Play Store Publication Guide for AfriTix

## 1. Set Up Google Play Developer Account

1. Go to the [Google Play Developer Console](https://play.google.com/console/signup)
2. Sign up and pay the one-time $25 registration fee
3. Complete the account details and developer agreement

## 2. Prepare Your App for Production

### Update app.json Configuration

Ensure your app.json and app.config.js files are properly configured with all required information:
- App name, version, and bundle identifier
- Icons and splash screens
- Required permissions
- Android adaptive icons

### Configure eas.json for Builds and Submissions

```json
{
  "cli": {
    "version": ">= 5.9.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "env": {
        "APP_ENV": "staging"
      }
    },
    "production": {
      "autoIncrement": true,
      "env": {
        "APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## 3. Secure Your Service Account Key

### ⚠️ IMPORTANT: Service Account Key Security ⚠️

The Google service account key (`google-service-account.json`) is highly sensitive and grants access to your Google Play Console. Follow these security practices:

1. **Never commit this file to version control**
   - Ensure it's listed in your `.gitignore` file
   - Consider using environment variables or a secure vault in CI/CD pipelines

2. **Restrict access to the key file**
   - Only share with team members who need to perform app submissions
   - Consider using a more restrictive service account with limited permissions

3. **Rotate keys periodically**
   - Create a new key every few months
   - Delete old keys from Google Cloud Console

4. **For CI/CD environments**
   - Store the key as an encrypted secret
   - Never log or display the key contents

## 4. Prepare Required Assets

1. **App Icon**: 512x512 PNG (already in assets/images/icon.png)
2. **Adaptive Icon**: Foreground image (already in assets/images/adaptive-icon.png)
3. **Feature Graphic**: 1024x500 JPG or PNG
4. **Screenshots**: At least 2 screenshots for each supported device type
   - Phone: 16:9 aspect ratio (e.g., 1920x1080)
   - 7-inch tablet: 16:10 aspect ratio
   - 10-inch tablet: 16:10 aspect ratio
5. **Short Description**: Up to 80 characters
6. **Full Description**: Up to 4000 characters

## 5. Build Your App Bundle

### Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

### Log in to your Expo account

```bash
eas login
```

### Configure the build

```bash
eas build:configure
```

### Build for Android

```bash
npm run build:android
```

This will create an Android App Bundle (.aab file) which is required for Google Play Store submission.

## 6. Create a Google Play Console Listing

1. Log in to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in the app details:
   - App name: AfriTix
   - Default language: French
   - App or game: App
   - Free or paid: Choose appropriate option
   - Declarations: Accept the declarations

## 7. Set Up Your Store Listing

1. Navigate to "Store presence" > "Store listing"
2. Fill in:
   - Short description
   - Full description
   - Upload screenshots
   - Upload feature graphic
   - Add app icon (automatically pulled from your app bundle)
   - App category: Events
   - Contact details
   - Privacy policy URL

## 8. Content Rating

1. Go to "Content rating" section
2. Complete the questionnaire
3. Submit for rating

## 9. Pricing & Distribution

1. Go to "Pricing & distribution"
2. Select countries where your app will be available
3. Declare whether your app is free or paid
4. Confirm compliance with US export laws
5. Confirm your app contains ads (if applicable)

## 10. App Release

1. Go to "Production" track
2. Create a new release
3. Upload your .aab file
4. Add release notes
5. Review and start rollout

## 11. Automated Submission with EAS

After building your app, you can use EAS Submit to automatically upload and submit your app:

```bash
npm run submit:android
```

This command uses the service account key to authenticate with Google Play and submit your app.

## 12. App Review Process

1. Google will review your app (typically takes 1-3 days)
2. Address any issues if the app is rejected
3. Once approved, your app will be published according to your rollout settings

## 13. Post-Launch

1. Monitor the app's performance in the Google Play Console
2. Collect user feedback
3. Plan updates based on user feedback and analytics

## Important Notes

1. **Privacy Policy**: Ensure you have a valid privacy policy URL, especially since your app collects user data
2. **Sensitive Permissions**: Justify any sensitive permissions your app requests
3. **Testing**: Thoroughly test your app before submission to avoid rejections
4. **Supabase Configuration**: Ensure your Supabase instance is properly configured for production use
5. **API Keys**: Make sure all API keys are properly secured and not hardcoded

## Troubleshooting Common Issues

1. **App crashes on startup**: Ensure all native dependencies are properly configured
2. **Missing permissions**: Check that all required permissions are declared in app.json
3. **Content flagged as inappropriate**: Review Google Play policies to ensure compliance
4. **Performance issues**: Optimize app performance before submission
5. **Rejected for metadata issues**: Ensure all store listing information complies with Google Play policies