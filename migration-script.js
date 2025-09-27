// Migration script to add duration to existing tasks
// Run this in the browser console or as a Node.js script

import { migrateTasksWithDuration } from './src/services/firestore.js'

// List of user IDs (replace with actual user IDs from your Firebase console)
const userIds = [
  // Add your 10 user IDs here
  // 'user1', 'user2', 'user3', etc.
]

async function runMigration() {
  console.log('Starting migration for all users...')
  
  for (const userId of userIds) {
    try {
      console.log(`Migrating user: ${userId}`)
      const migrationCount = await migrateTasksWithDuration(userId)
      console.log(`✅ Migration completed for user ${userId}: Updated ${migrationCount} tasks`)
    } catch (error) {
      console.error(`❌ Migration failed for user ${userId}:`, error)
    }
  }
  
  console.log('Migration completed for all users!')
}

// Run the migration
runMigration().catch(console.error)
