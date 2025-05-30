# Modash API Testing Guide

## Quick Test Steps

### 1. Test API Connection
Open your browser and navigate to:
```
http://localhost:3000/api/discovery/test
```

This will test:
- API key authentication
- Credit usage endpoint
- Basic Instagram search

### 2. Test Platform-Specific Searches
Use a tool like curl or Postman:
```bash
# Test all platforms
curl -X POST http://localhost:3000/api/discovery/test

# Test discovery search
curl -X POST http://localhost:3000/api/discovery/search \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "followersMin": 10000,
    "followersMax": 100000
  }'
```

### 3. Check the Staff Discovery Page
1. Navigate to: http://localhost:3000/staff/discovery
2. Open browser console (F12)
3. Select Instagram platform
4. Click "Search Influencers"
5. Check console logs for detailed API information

## What We Changed Based on Modash Support

1. **Platform-specific endpoints**: Changed from `/v1/discovery/search` to `/{platform}/search`
2. **Enhanced logging**: Added detailed request/response logging
3. **Better error handling**: More specific error messages

## Troubleshooting

### If you see "404 Not Found"
- The endpoint format is correct (`/{platform}/search`)
- This might mean the API key needs activation at https://marketer.modash.io/developer

### If you see "401 Unauthorized"
- Check your API key in `.env.local`
- Verify the key starts with the correct prefix shown in Modash dashboard

### If you see "403 Forbidden"
- Your API key might not have Discovery API access
- Contact Modash support to enable Discovery API for your account

### Console Logs to Check
Look for these in your browser/terminal console:
- `🔗 Modash API Request:` - Shows the full URL being called
- `📤 Request Body:` - Shows what we're sending
- `📡 Modash Response:` - Shows what Modash returns
- `❌ Modash API Error Response:` - Detailed error information

## Next Steps

1. If API is not working, share the console logs with Modash support
2. They can verify if your API key has Discovery API access enabled
3. Ask them specifically about the endpoint format for your account type

## Mock Data Fallback
If the API fails, the system will use mock data so you can continue development. Look for:
- `"note": "Mock data - Modash API credentials pending activation"`
- `"apiError":` will show the actual Modash error 