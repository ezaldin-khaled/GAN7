# New Search Parameter for Media

## Overview

The new `include_media` parameter allows you to retrieve all media items for each profile directly in the search response, eliminating the need for multiple API calls and improving performance.

## API Changes

### Endpoint
`/api/dashboard/search/`

### New Parameter
- `include_media=true` - Include all media data in the response

### Example Request
```bash
GET /api/dashboard/search/?profile_type=talent&city=London&include_media=true&page_size=20
```

## Response Structure Changes

### Before (without include_media)
```json
{
    "id": 123,
    "user": {...},
    "media_count": {
        "images": 15,
        "videos": 8
    }
    // No media_items array
}
```

### After (with include_media=true)
```json
{
    "id": 123,
    "user": {...},
    "media_count": {
        "images": 15,
        "videos": 8
    },
    "media_items": [
        {
            "id": 201,
            "name": "Professional Headshot",
            "media_info": "High-quality headshot for modeling",
            "media_type": "image",
            "media_file": "https://example.com/media/headshot.jpg",
            "thumbnail": "https://example.com/thumbnails/headshot.jpg",
            "created_at": "2024-01-01T00:00:00Z",
            "is_test_video": false,
            "is_about_yourself_video": false
        }
    ]
}
```

## Media Item Properties

Each media item includes:
- `id` - Media ID (use this for sharing)
- `name` - Media name/title
- `media_info` - Description
- `media_type` - "image" or "video"
- `media_file` - Full URL to the media file
- `thumbnail` - URL to thumbnail (if available)
- `created_at` - When the media was uploaded
- `is_test_video` - Boolean, skip these for sharing
- `is_about_yourself_video` - Boolean, skip these for sharing

## Frontend Implementation

### Using the SearchTab Component

The SearchTab component now includes a checkbox to enable media inclusion:

```jsx
// The checkbox is automatically added to the search interface
// When checked, it adds include_media=true to the API request
```

### Using Utility Functions

#### 1. getTalentWithMedia()
```javascript
import { getTalentWithMedia } from '../api/searchUtils';

// Get talent with media in one request
const getTalentWithMedia = async (searchParams) => {
    const params = {
        ...searchParams,
        include_media: 'true'
    };
    
    const response = await fetch(`/api/dashboard/search/?${new URLSearchParams(params)}`);
    const data = await response.json();
    
    // Extract shareable media (exclude test videos)
    const shareableMedia = data.results.flatMap(talent => 
        talent.media_items?.filter(media => 
            !media.is_test_video && !media.is_about_yourself_video
        ) || []
    );
    
    return {
        talentResults: data.results,
        shareableMedia: shareableMedia
    };
};

// Usage: Get London talent with all their media
const results = await getTalentWithMedia({
    profile_type: 'talent',
    city: 'London',
    page_size: 20
});

console.log(`Found ${results.shareableMedia.length} shareable media items`);
```

#### 2. searchWithMedia()
```javascript
import { searchWithMedia } from '../api/searchUtils';

// Search for any profile type with media included
const result = await searchWithMedia({
    profile_type: 'talent',
    query: 'actor',
    page_size: 10
});

console.log(`Found ${result.shareableMedia.length} shareable media items`);
```

#### 3. extractShareableMedia()
```javascript
import { extractShareableMedia } from '../api/searchUtils';

// Extract shareable media from search results
const shareableMedia = extractShareableMedia(searchResults);
```

## Benefits

1. **No more multiple API calls** - Get all media in one request
2. **Better performance** - No rate limiting issues
3. **Complete data** - All media info available immediately
4. **Easier media sharing** - Direct access to media IDs and URLs
5. **Better UX** - Can show media previews without additional requests

## Example Components

### MediaSearchExample
A demonstration component showing how to use the new functionality:
```jsx
import MediaSearchExample from '../Components/examples/MediaSearchExample';

// Use in your app to test the feature
<MediaSearchExample />
```

### Updated SharedMediaTab
The SharedMediaTab component has been updated to use the new utility functions for better performance.

## Backend Requirements

The backend API needs to be updated to support the `include_media` parameter. When this parameter is present and set to `true`, the API should:

1. Include a `media_items` array in each profile result
2. Populate the array with all media items for that profile
3. Include all media item properties as specified above
4. Maintain backward compatibility when the parameter is not present

## Migration Guide

### For Existing Code

1. **Update SearchTab usage**: The checkbox is automatically available
2. **Replace multiple API calls**: Use `getTalentWithMedia()` instead
3. **Update media processing**: Use `extractShareableMedia()` utility

### Example Migration

**Before:**
```javascript
// Multiple API calls
const searchResponse = await axios.get('/api/dashboard/search/?profile_type=talent');
const profiles = searchResponse.data.results;

// Then fetch media for each profile
for (const profile of profiles) {
    const mediaResponse = await axios.get(profile.media_url);
    // Process media...
}
```

**After:**
```javascript
// Single API call with media included
const result = await getTalentWithMedia({
    profile_type: 'talent',
    page_size: 20
});

// Media is already available
const shareableMedia = result.shareableMedia;
```

## Testing

1. Enable the "Include Media" checkbox in SearchTab
2. Perform a search for talent profiles
3. Check the browser console for media information
4. Verify that media items are properly filtered (excluding test videos)

## Error Handling

The utility functions include proper error handling:
- Network errors are caught and logged
- API errors are returned with descriptive messages
- Failed requests return empty arrays instead of throwing

## Performance Considerations

- Use appropriate `page_size` values to avoid large responses
- Consider implementing pagination for large media collections
- Cache results when appropriate
- Monitor API response times with media inclusion enabled 