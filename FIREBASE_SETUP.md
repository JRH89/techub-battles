# Firebase Setup for TecHub Battles

## Overview
Battle results are stored in Firebase Firestore for leaderboard tracking. This keeps battle data separate from the main Rails database and allows for high-volume writes without impacting the main app.

## Setup Steps

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name it `techub-battles` (or your preferred name)
4. Disable Google Analytics (optional for this use case)
5. Click "Create project"

### 2. Enable Firestore Database
1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll add security rules)
4. Select your preferred location (us-central1 recommended)
5. Click "Enable"

### 3. Get Firebase Config
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register app (name it "TecHub Battles Web")
5. Copy the config values

### 4. Add Config to .env.local
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=techub-battles.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=techub-battles
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=techub-battles.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Set Firestore Security Rules
In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to write battle results (public battles)
    // But prevent deletion/updates (immutable records)
    match /battles/{battleId} {
      allow create: if true;
      allow read: if true;
      allow update, delete: if false;
    }
    
    // Future: Add authentication for user-specific data
    // match /users/{userId} {
    //   allow read, write: if request.auth != null && request.auth.uid == userId;
    // }
  }
}
```

### 6. Create Firestore Indexes (Optional but Recommended)
For better query performance, create these composite indexes:

1. Go to Firestore Database → Indexes
2. Create composite index:
   - Collection: `battles`
   - Fields: `winner.login` (Ascending), `timestamp` (Descending)
3. Create another:
   - Collection: `battles`
   - Fields: `loser.login` (Ascending), `timestamp` (Descending)

## Data Structure

### Battle Document
```typescript
{
  timestamp: Timestamp,
  winner: {
    login: string,
    profile_id: number,
    archetype: string,
    spirit_animal: string,
    final_hp: number
  },
  loser: {
    login: string,
    profile_id: number,
    archetype: string,
    spirit_animal: string,
    final_hp: number
  },
  stats: {
    total_turns: number,
    total_damage_dealt_by_winner: number,
    total_damage_dealt_by_loser: number,
    winner_had_type_advantage: boolean,
    battle_duration_seconds: number
  },
  version: string // Battle engine version
}
```

## Rails Integration

### Option 1: Firebase Admin SDK (Recommended)
Install in Rails:
```ruby
gem 'firebase-admin-sdk'
```

Query battles:
```ruby
require 'firebase_admin'

# Initialize
FirebaseAdmin::App.initialize_app(
  project_id: ENV['FIREBASE_PROJECT_ID'],
  credentials: ENV['FIREBASE_CREDENTIALS_JSON']
)

# Query battles
db = FirebaseAdmin::Firestore.client
battles = db.col('battles')
  .where('winner.login', '==', 'username')
  .order('timestamp', 'desc')
  .limit(10)
  .get
```

### Option 2: REST API
Query via HTTP:
```ruby
require 'net/http'
require 'json'

url = "https://firestore.googleapis.com/v1/projects/#{project_id}/databases/(default)/documents/battles"
response = Net::HTTP.get(URI(url))
battles = JSON.parse(response)
```

## Scaling Considerations

### Current Setup (Good for 100k+ battles/month)
- ✅ Client-side writes (no server load)
- ✅ Immutable records (no updates/deletes)
- ✅ Indexed queries for leaderboards
- ✅ Separate from main Rails DB

### Future Optimizations
1. **Batch writes** - If doing bulk imports
2. **Cloud Functions** - Auto-aggregate leaderboard stats
3. **Caching** - Cache leaderboard in Redis
4. **Partitioning** - Archive old battles after 6 months

## Cost Estimates

### Firestore Pricing (Free Tier)
- 50k reads/day
- 20k writes/day
- 20k deletes/day
- 1 GB storage

### Estimated Usage
- 1000 battles/day = 1000 writes
- Leaderboard queries = ~5000 reads/day
- **Well within free tier!**

### When to Upgrade
- 20k+ battles/day
- Complex aggregation queries
- Real-time leaderboard updates

## Security Best Practices

### ✅ Current Implementation
- Public writes (anyone can save battles)
- No PII stored (just usernames)
- Immutable records (can't edit history)
- Rate limiting via Firestore rules (future)

### 🔒 Future Enhancements
1. **Add reCAPTCHA** - Prevent bot spam
2. **Rate limiting** - Max battles per IP/hour
3. **Authentication** - Optional user accounts
4. **Data validation** - Cloud Functions to validate battle data

## Monitoring

### Firebase Console
- Monitor writes/reads in Usage tab
- Check errors in Firestore logs
- Set up budget alerts

### Application Logs
- Battle saves logged to console
- Failed saves don't break battles
- Track save success rate

## Troubleshooting

### "Permission denied" errors
- Check Firestore security rules
- Verify API key in .env.local

### Slow queries
- Add composite indexes
- Limit query results
- Cache frequently accessed data

### High costs
- Review usage in Firebase Console
- Archive old battles
- Optimize query patterns
