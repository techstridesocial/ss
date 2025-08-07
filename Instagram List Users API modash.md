# Instagram List Users API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Search the list of influencers using the Modash Discovery API. This endpoint allows you to find influencers based on various filters and criteria.

**✅ Implementation Status**: Fully integrated into Stride Social Dashboard
- **Service Method**: `modashService.listUsers(query, limit)`
- **API Route**: `/api/discovery/list-users` 
- **Usage**: Automatic for simple text searches in `/staff/discovery`
- **Cost**: **FREE** - No credits used

## Endpoint
```
GET /instagram/users
```

## Authentication
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/users?limit=0&query=string' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

## Query Parameters

### Basic Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Max items to get |
| `query` | string | No | String to search by |

## Response Format

### Success Response (200)
Returns an array of user objects with the following structure:

```json
{
  "error": false,
  "users": [
    {
      "userId": "232192182",
      "username": "string",
      "profile_picture": "https://imgigp.modash.io/v2?...",
      "followers": 313583625,
      "isVerified": true
    }
  ]
}
```

## User Object Schema

### Required Fields
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `userId` | string | User ID | `"232192182"` |
| `username` | string | Username/handle | `"cristiano"` |
| `followers` | number | User's number of followers | `313583625` |
| `isVerified` | boolean | User has verified badge | `true` |

### Optional Fields
| Field | Type | Description |
|-------|------|-------------|
| `profile_picture` | string | URL to profile picture |

## Example Requests

### Basic Search
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/users?limit=10&query=cristiano' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### Response Example
```json
{
  "error": false,
  "users": [
    {
      "userId": "232192182",
      "username": "cristiano", 
      "profile_picture": "https://imgigp.modash.io/v2?mb0KwpL92uYofJiSjDn1%2F6peL1lBwv3s%2BUvShHERlDat1QLGClxLKQGAKLBUyw%2BxYFIVyPBQ5WdIh3NcFeQuvFZ%2FtSydPnsw1%2F0NdBJIC0M2xRjdOjR%2FRPTwHlk9ADoJrOPQt%2BBH8xfdE2dL1avFgg%3D%3D",
      "followers": 313583625,
      "isVerified": true
    }
  ]
}
```

## Error Response
```json
{
  "error": true,
  "message": "Error description"
}
```

## Implementation Notes

### Authentication
- Requires Bearer token in Authorization header
- API key must be valid and have sufficient credits

### Rate Limiting
- Subject to Modash API rate limits
- Monitor credit usage to avoid exceeding monthly limits

### Data Freshness
- Follower counts are updated regularly by Modash
- Profile pictures are cached and may not reflect latest changes immediately

### Best Practices
1. **Pagination**: Use `limit` parameter to control response size
2. **Search Optimization**: Use specific search terms in `query` for better results
3. **Credit Management**: Monitor API usage to stay within monthly credit limits
4. **Caching**: Cache results when possible to reduce API calls

## Integration Example

### JavaScript/Node.js
```javascript
async function searchInfluencers(query, limit = 10) {
  const response = await fetch(
    `https://api.modash.io/v1/instagram/users?limit=${limit}&query=${encodeURIComponent(query)}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.MODASH_API_KEY}`
      }
    }
  );
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data.users;
}

// Usage
const cristiano = await searchInfluencers('cristiano', 5);
console.log(`Found ${cristiano.length} users`);
```

### Python
```python
import requests
import os

def search_influencers(query, limit=10):
    url = f"https://api.modash.io/v1/instagram/users"
    params = {
        'limit': limit,
        'query': query
    }
    headers = {
        'Authorization': f"Bearer {os.getenv('MODASH_API_KEY')}"
    }
    
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    
    if data.get('error'):
        raise Exception(data.get('message', 'API request failed'))
    
    return data.get('users', [])

# Usage
users = search_influencers('cristiano', 5)
print(f"Found {len(users)} users")
```

## Related Endpoints
- `/v1/discovery/search` - Advanced search with filters
- `/v1/discovery/profile/{userId}/report` - Detailed influencer reports
- `/v1/credits` - Check remaining API credits

## Troubleshooting

### Common Issues
1. **Authentication Error**: Verify API key is correct and active
2. **No Results**: Try broader search terms or check if user exists
3. **Rate Limit**: Implement delays between requests
4. **Credit Limit**: Monitor monthly usage and upgrade plan if needed

### Error Codes
- `401 Unauthorized`: Invalid or missing API key
- `403 Forbidden`: Insufficient credits or permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Modash API issue

## Support
For technical support or API questions, contact Modash support or refer to the official API documentation at https://docs.modash.io/