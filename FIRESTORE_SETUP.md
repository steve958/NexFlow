# Firestore Security Rules Setup

## Problem
The application is getting "Missing or insufficient permissions" errors when trying to create/update user profiles because Firestore security rules are not configured.

## Solution
Deploy the security rules in `firestore.rules` to your Firebase project.

## Option 1: Using Firebase Console (Recommended)

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to "Firestore Database"
4. Click on the "Rules" tab
5. Replace the default rules with the content from `firestore.rules`:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read and write their own projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Allow users to query their own projects
    match /projects/{projectId} {
      allow list: if request.auth != null && request.auth.uid in resource.data.userId;
    }
  }
}
```

6. Click "Publish"

## Option 2: Using Firebase CLI

If you have Firebase CLI installed and initialized:

```bash
firebase deploy --only firestore:rules
```

## What These Rules Do

- **Users Collection**: Authenticated users can only read/write their own profile document (where document ID matches their auth UID)
- **Projects Collection**: Authenticated users can only read/write/create projects where they are the owner (userId field matches their auth UID)
- **Security**: Prevents users from accessing other users' data
- **Authentication Required**: All operations require a valid Firebase Auth token

## Testing

After deploying the rules, the profile creation and updates should work without permission errors.