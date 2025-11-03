import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Clerk user profile
    const uploadedImage = await clerkClient.users.updateUserProfileImage(userId, {
      file: buffer
    })

    if (!uploadedImage || !uploadedImage.imageUrl) {
      throw new Error('Failed to upload image to Clerk')
    }

    console.log('✅ Profile image uploaded to Clerk:', uploadedImage.imageUrl)

    return NextResponse.json({
      success: true,
      imageUrl: uploadedImage.imageUrl,
      message: 'Profile image uploaded successfully'
    })

  } catch (_error) {
    console.error('Error uploading profile image:', error)
    return NextResponse.json(
      { error: 'Failed to upload profile image' },
      { status: 500 }
    )
  }
}
