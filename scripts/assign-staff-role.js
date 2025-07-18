require('dotenv').config({ path: '.env.local' })
const { createClerkClient } = require('@clerk/backend')

async function assignStaffRole() {
  try {
    console.log('🔧 Assigning staff role to users...')
    
    // Initialize Clerk client with secret key
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    
    if (!process.env.CLERK_SECRET_KEY) {
      console.error('❌ CLERK_SECRET_KEY not found in environment variables')
      return
    }
    
    // Get all users
    const users = await clerkClient.users.getUserList()
    console.log(`📋 Found ${users.data.length} users`)
    
    for (const user of users.data) {
      const email = user.emailAddresses[0]?.emailAddress
      const currentRole = user.publicMetadata?.role
      
      console.log(`👤 User: ${user.firstName} ${user.lastName} (${email})`)
      console.log(`📊 Current role: ${currentRole || 'None'}`)
      
      // If no role is assigned, assign staff role
      if (!currentRole) {
        console.log(`🔄 Assigning STAFF role to ${email}...`)
        
        // Update user with staff role
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            role: 'STAFF'
          }
        })
        
        console.log(`✅ Assigned STAFF role to ${email}`)
      }
    }
    
    console.log('🎉 Role assignment complete!')
    
  } catch (error) {
    console.error('❌ Error assigning roles:', error)
  }
}

// Run the script
assignStaffRole() 