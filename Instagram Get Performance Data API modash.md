# Instagram Get Performance Data API - Modash Documentation

**Part of**: [Instagram Modash API Integration](./Instagram%20Modash%20API%20Integration.md)

## Overview
Returns the performance data of an Instagram account for the last 6, 12 and 30 posts & reels. The data is computed on demand, so if it is not available from the first request, a second call should be performed after ~5 minutes.

Every successful request costs **0.25 credits**. If the response code is `retry_later` or there is an error on our side you will not be charged.

**✅ Implementation Status**: Fully integrated into Stride Social Dashboard
- **Service Method**: `modashService.getPerformanceData(url, maxRetries)`
- **API Route**: `/api/discovery/performance-data`
- **Usage**: Automatic when clicking "View" in influencer detail panel
- **Cost**: **0.25 credits** per successful request
- **Features**: Automatic retry logic for `retry_later` responses

## Endpoint
```
GET /instagram/performance-data
```

## Authentication
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/performance-data?url=string' \
  -H 'Authorization: Bearer <YOUR_token_HERE>'
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ | Username (@handle) or user id |

**Example:** `cristiano` or `232192182`

## Response Format

### Success Response (200)
Returns detailed performance statistics for posts and reels:

```json
{
  "posts": {
    "total": 0,
    "posts_with_hidden_likes": 0,
    "likes": { "...": "..." },
    "comments": { "...": "..." },
    "views": { "...": "..." },
    "engagement_rate": ["...", "..."],
    "posting_statistics": { "...": "..." }
  },
  "reels": {
    "total": 0,
    "reels_with_hidden_likes": 0,
    "likes": { "...": "..." },
    "comments": { "...": "..." },
    "views": { "...": "..." },
    "engagement_rate": ["...", "..."],
    "posting_statistics": { "...": "..." }
  }
}
```

## Response Schema

### Posts Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of posts analyzed |
| `posts_with_hidden_likes` | number | Number of posts with hidden like counts |
| `likes` | object | Likes statistics (mean, min, max, median) |
| `comments` | object | Comments statistics (mean, min, max, median) |
| `views` | object | Views statistics (mean, min, max, median) |
| `engagement_rate` | array | Engagement rate statistics |
| `posting_statistics` | object | Posting frequency and timing data |

### Reels Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of reels analyzed |
| `reels_with_hidden_likes` | number | Number of reels with hidden like counts |
| `likes` | object | Likes statistics (mean, min, max, median) |
| `comments` | object | Comments statistics (mean, min, max, median) |
| `views` | object | Views statistics (mean, min, max, median) |
| `engagement_rate` | array | Engagement rate statistics |
| `posting_statistics` | object | Posting frequency and timing data |

### Statistics Objects Structure
Each statistics object (likes, comments, views) contains:

| Field | Type | Description |
|-------|------|-------------|
| `mean` | array of objects | Average values with `numberOfItems` and `value` |
| `min` | array of objects | Minimum values with `numberOfItems` and `value` |
| `max` | array of objects | Maximum values with `numberOfItems` and `value` |
| `median` | array of objects | Median values with `numberOfItems` and `value` |

### Posting Statistics Object
| Field | Type | Description |
|-------|------|-------------|
| `weekDayHour` | object | Posting patterns by day/hour |
| `daily` | object | Daily posting statistics |

#### WeekDayHour Object
| Field | Type | Description |
|-------|------|-------------|
| `mean` | object | Average posting times with `numberOfItems` and `value` |

#### Daily Object
| Field | Type | Description |
|-------|------|-------------|
| `mean` | object | Daily posting frequency with `numberOfItems` and `value` |

## Example Requests

### Get Performance Data by Username
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/performance-data?url=cristiano' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

### Get Performance Data by User ID
```bash
curl -i -X GET \
  'https://api.modash.io/v1/instagram/performance-data?url=232192182' \
  -H 'Authorization: Bearer YOUR_API_KEY'
```

## Example Response
```json
{
  "posts": {
    "total": 30,
    "posts_with_hidden_likes": 0,
    "likes": {
      "mean": [
        {
          "numberOfItems": 30,
          "value": 2500000
        }
      ],
      "min": [
        {
          "numberOfItems": 30,
          "value": 800000
        }
      ],
      "max": [
        {
          "numberOfItems": 30,
          "value": 5200000
        }
      ],
      "median": [
        {
          "numberOfItems": 30,
          "value": 2200000
        }
      ]
    },
    "comments": {
      "mean": [
        {
          "numberOfItems": 30,
          "value": 45000
        }
      ],
      "min": [
        {
          "numberOfItems": 30,
          "value": 15000
        }
      ],
      "max": [
        {
          "numberOfItems": 30,
          "value": 85000
        }
      ],
      "median": [
        {
          "numberOfItems": 30,
          "value": 42000
        }
      ]
    },
    "views": {
      "mean": [
        {
          "numberOfItems": 30,
          "value": 8500000
        }
      ],
      "min": [
        {
          "numberOfItems": 30,
          "value": 3200000
        }
      ],
      "max": [
        {
          "numberOfItems": 30,
          "value": 15000000
        }
      ],
      "median": [
        {
          "numberOfItems": 30,
          "value": 7800000
        }
      ]
    },
    "engagement_rate": [
      {
        "numberOfItems": 30,
        "value": 0.035
      }
    ],
    "posting_statistics": {
      "weekDayHour": {
        "mean": {
          "numberOfItems": 30,
          "value": 14.5
        }
      },
      "daily": {
        "mean": {
          "numberOfItems": 30,
          "value": 1.2
        }
      }
    }
  },
  "reels": {
    "total": 25,
    "reels_with_hidden_likes": 0,
    "likes": {
      "mean": [
        {
          "numberOfItems": 25,
          "value": 3200000
        }
      ],
      "min": [
        {
          "numberOfItems": 25,
          "value": 1500000
        }
      ],
      "max": [
        {
          "numberOfItems": 25,
          "value": 6800000
        }
      ],
      "median": [
        {
          "numberOfItems": 25,
          "value": 2900000
        }
      ]
    },
    "comments": {
      "mean": [
        {
          "numberOfItems": 25,
          "value": 62000
        }
      ],
      "min": [
        {
          "numberOfItems": 25,
          "value": 25000
        }
      ],
      "max": [
        {
          "numberOfItems": 25,
          "value": 125000
        }
      ],
      "median": [
        {
          "numberOfItems": 25,
          "value": 58000
        }
      ]
    },
    "views": {
      "mean": [
        {
          "numberOfItems": 25,
          "value": 15000000
        }
      ],
      "min": [
        {
          "numberOfItems": 25,
          "value": 8000000
        }
      ],
      "max": [
        {
          "numberOfItems": 25,
          "value": 35000000
        }
      ],
      "median": [
        {
          "numberOfItems": 25,
          "value": 13500000
        }
      ]
    },
    "engagement_rate": [
      {
        "numberOfItems": 25,
        "value": 0.042
      }
    ],
    "posting_statistics": {
      "weekDayHour": {
        "mean": {
          "numberOfItems": 25,
          "value": 16.2
        }
      },
      "daily": {
        "mean": {
          "numberOfItems": 25,
          "value": 0.8
        }
      }
    }
  }
}
```

## Error Responses

### Retry Later Response
```json
{
  "status": "retry_later",
  "message": "Data is being processed. Please retry in 5 minutes."
}
```

### Error Response
```json
{
  "error": true,
  "message": "User not found or invalid URL parameter"
}
```

## Implementation Notes

### Credit Usage
- **Cost**: 0.25 credits per successful request
- **No charge**: For `retry_later` responses or server errors
- Monitor your credit usage to stay within monthly limits

### Data Processing
- Performance data is computed on demand
- If data is not immediately available, wait ~5 minutes before retrying
- Check for `retry_later` status in response

### Analysis Periods
The API analyzes performance for:
- **Last 6 posts/reels**
- **Last 12 posts/reels** 
- **Last 30 posts/reels**

### Data Accuracy
- Hidden likes are tracked separately and excluded from calculations
- Only publicly available data is analyzed
- Results reflect actual engagement metrics from Instagram

## Integration Examples

### JavaScript/Node.js
```javascript
async function getPerformanceData(username, maxRetries = 3) {
  const baseUrl = 'https://api.modash.io/v1/instagram/performance-data';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${baseUrl}?url=${encodeURIComponent(username)}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MODASH_API_KEY}`
      }
    });
    
    const data = await response.json();
    
    if (data.status === 'retry_later') {
      if (attempt < maxRetries) {
        console.log('Data processing, retrying in 5 minutes...');
        await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
        continue;
      }
      throw new Error('Data still processing after maximum retries');
    }
    
    if (data.error) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }
}

// Usage
try {
  const performance = await getPerformanceData('cristiano');
  console.log(`Posts analyzed: ${performance.posts.total}`);
  console.log(`Reels analyzed: ${performance.reels.total}`);
  console.log(`Average post likes: ${performance.posts.likes.mean[0].value}`);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python
```python
import requests
import time
import os

def get_performance_data(username, max_retries=3):
    url = "https://api.modash.io/v1/instagram/performance-data"
    headers = {
        'Authorization': f"Bearer {os.getenv('MODASH_API_KEY')}"
    }
    params = {'url': username}
    
    for attempt in range(1, max_retries + 1):
        response = requests.get(url, params=params, headers=headers)
        data = response.json()
        
        if data.get('status') == 'retry_later':
            if attempt < max_retries:
                print("Data processing, retrying in 5 minutes...")
                time.sleep(5 * 60)  # Wait 5 minutes
                continue
            raise Exception("Data still processing after maximum retries")
        
        if data.get('error'):
            raise Exception(data.get('message', 'API request failed'))
        
        return data
    
    raise Exception("Maximum retries exceeded")

# Usage
try:
    performance = get_performance_data('cristiano')
    print(f"Posts analyzed: {performance['posts']['total']}")
    print(f"Reels analyzed: {performance['reels']['total']}")
    if performance['posts']['likes']['mean']:
        avg_likes = performance['posts']['likes']['mean'][0]['value']
        print(f"Average post likes: {avg_likes:,}")
except Exception as e:
    print(f"Error: {e}")
```

## Use Cases

### Performance Analysis
- Compare posts vs reels performance
- Identify best-performing content types
- Track engagement patterns over time

### Content Strategy
- Analyze optimal posting times
- Understand audience engagement preferences
- Benchmark against historical performance

### Influencer Evaluation
- Assess authentic engagement rates
- Verify performance claims
- Compare influencer metrics

## Best Practices

1. **Handle Retry Logic**: Always implement retry logic for `retry_later` responses
2. **Monitor Credits**: Track API usage to avoid exceeding monthly limits
3. **Cache Results**: Store performance data locally to reduce API calls
4. **Error Handling**: Implement robust error handling for network and API errors
5. **Rate Limiting**: Respect API rate limits and implement appropriate delays

## Related Endpoints
- `/v1/instagram/users` - Search and list influencers
- `/v1/discovery/search` - Advanced influencer discovery
- `/v1/credits` - Check remaining API credits

## Troubleshooting

### Common Issues
1. **User Not Found**: Verify username/ID is correct and public
2. **Retry Later**: Data processing takes time, implement retry logic
3. **Credit Exhausted**: Check remaining credits before making requests
4. **Rate Limited**: Implement delays between requests

### Error Codes
- `200` - Success
- `retry_later` - Data processing, retry in 5 minutes
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient credits)
- `404` - User not found
- `429` - Too many requests (rate limited)
- `500` - Internal server error

## Support
For technical support or questions about the Performance Data API, contact Modash support or refer to the official documentation at https://docs.modash.io/