import { auth } from '@clerk/nextjs/server'
import { NextRequest as _NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db/connection'

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { originalUrl, title, influencerId } = await req.json()

    if (!originalUrl) {
      return NextResponse.json({ error: 'Original URL is required' }, { status: 400 })
    }

    // Short.io API configuration
    const shortIoApiKey = process.env.SHORT_IO_API_KEY
    const domain = 'stridelinks.io'

    if (!shortIoApiKey) {
      return NextResponse.json({ error: 'Short.io API key not configured' }, { status: 500 })
    }

    // Create short link using Short.io API
    const shortIoResponse = await fetch('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Authorization': shortIoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        originalURL: originalUrl,
        domain: domain,
        title: title || `Tracking link for influencer ${influencerId}`,
        tags: [`influencer_${influencerId}`, 'campaign_tracking'],
        allowDuplicates: false
      })
    })

    if (!shortIoResponse.ok) {
      const errorData = await shortIoResponse.json()
      console.error('Short.io API error:', errorData)
      return NextResponse.json({ 
        error: 'Failed to create short link',
        details: errorData 
      }, { status: 500 })
    }

    const shortLinkData = await shortIoResponse.json()

    // Save to database
    try {
      await query(
        `INSERT INTO tracking_links (influencer_id, short_io_link_id, short_url, original_url, title, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          influencerId,
          shortLinkData.idString,
          shortLinkData.shortURL,
          shortLinkData.originalURL,
          shortLinkData.title,
          userId
        ]
      )
    } catch (dbError) {
      console.error('Failed to save tracking link to database:', dbError)
      // Continue anyway - the short link was created successfully
    }

    // Return the created short link
    return NextResponse.json({
      shortUrl: shortLinkData.shortURL,
      originalUrl: shortLinkData.originalURL,
      title: shortLinkData.title,
      clicks: 0,
      createdAt: shortLinkData.createdAt,
      linkId: shortLinkData.idString
    })

  } catch (_error) {
    console.error('Error creating short link:', error)
    return NextResponse.json(
      { error: 'Failed to create tracking link' }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const influencerId = searchParams.get('influencerId')

    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 })
    }

    // Get tracking links from database
    const dbLinks = await query(
      `SELECT id, short_io_link_id, short_url, original_url, title, clicks, created_at
       FROM tracking_links 
       WHERE influencer_id = $1 
       ORDER BY created_at DESC`,
      [influencerId]
    )

    // Sync click counts from Short.io for recent links
    const shortIoApiKey = process.env.SHORT_IO_API_KEY
    if (shortIoApiKey && dbLinks.length > 0) {
      for (const link of dbLinks) {
        try {
          const shortIoResponse = await fetch(`https://api.short.io/links/${link.short_io_link_id}`, {
            method: 'GET',
            headers: {
              'Authorization': shortIoApiKey,
              'Content-Type': 'application/json',
            }
          })

          if (shortIoResponse.ok) {
            const shortIoData = await shortIoResponse.json()
            const currentClicks = shortIoData.totalClicks || 0
            
            // Update click count in database if it's different
            if (currentClicks !== link.clicks) {
              await query(
                'UPDATE tracking_links SET clicks = $1 WHERE id = $2',
                [currentClicks, link.id]
              )
              link.clicks = currentClicks
            }
          }
        } catch (syncError) {
          console.error(`Failed to sync clicks for link ${link.short_io_link_id}:`, syncError)
          // Continue with other links
        }
      }
    }

    // Format the links for the frontend
    const formattedLinks = dbLinks.map((link: any) => ({
      shortUrl: link.short_url,
      originalUrl: link.original_url,
      title: link.title,
      clicks: link.clicks || 0,
      createdAt: link.created_at,
      linkId: link.short_io_link_id
    }))

    return NextResponse.json({ links: formattedLinks })

  } catch (_error) {
    console.error('Error fetching tracking links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE handler - Delete a tracking link
export async function DELETE(_request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Delete from Short.io
    const response = await fetch(`https://api.short.io/links/${linkId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY!,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('Short.io delete failed:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to delete link from Short.io' }, { status: response.status })
    }

    // Delete from database
    try {
      await query('DELETE FROM tracking_links WHERE short_io_link_id = $1', [linkId])
    } catch (dbError) {
      console.error('Failed to delete tracking link from database:', dbError)
      // Continue anyway - the short link was deleted successfully from Short.io
    }

    return NextResponse.json({ success: true })

  } catch (_error) {
    console.error('Error deleting tracking link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT handler - Update a tracking link
export async function PUT(_request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkId, title } = body

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    // Update link in Short.io
    const updateData: any = {}
    if (title !== undefined) {
      updateData.title = title
    }

    const response = await fetch(`https://api.short.io/links/update`, {
      method: 'POST',
      headers: {
        'Authorization': process.env.SHORT_IO_API_KEY!,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idString: linkId,
        ...updateData
      })
    })

    if (!response.ok) {
      console.error('Short.io update failed:', response.status, await response.text())
      return NextResponse.json({ error: 'Failed to update link in Short.io' }, { status: response.status })
    }

    const updatedLink = await response.json()

    // Update database
    try {
      await query(
        'UPDATE tracking_links SET title = $1, updated_at = NOW() WHERE short_io_link_id = $2',
        [title, linkId]
      )
    } catch (dbError) {
      console.error('Failed to update tracking link in database:', dbError)
      // Continue anyway - the short link was updated successfully in Short.io
    }

    return NextResponse.json({
      linkId: updatedLink.idString,
      title: updatedLink.title,
      shortUrl: `https://${updatedLink.domain}/${updatedLink.path}`,
      originalUrl: updatedLink.originalURL,
      clicks: updatedLink.clicks || 0,
      createdAt: updatedLink.createdAt
    })

  } catch (_error) {
    console.error('Error updating tracking link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 