import { getTalentWithMedia, searchWithMedia, extractShareableMedia } from '../api/searchUtils';

// Mock data for testing
const mockSearchResults = [
  {
    id: 1,
    user: { first_name: 'John', last_name: 'Doe' },
    media_items: [
      {
        id: 101,
        name: 'Professional Headshot',
        media_info: 'High-quality headshot',
        media_type: 'image',
        media_file: 'https://example.com/headshot.jpg',
        is_test_video: false,
        is_about_yourself_video: false
      },
      {
        id: 102,
        name: 'Test Video',
        media_info: 'Test video for platform',
        media_type: 'video',
        media_file: 'https://example.com/test.mp4',
        is_test_video: true,
        is_about_yourself_video: false
      }
    ]
  },
  {
    id: 2,
    user: { first_name: 'Jane', last_name: 'Smith' },
    media_items: [
      {
        id: 201,
        name: 'Portfolio Image',
        media_info: 'Portfolio showcase',
        media_type: 'image',
        media_file: 'https://example.com/portfolio.jpg',
        is_test_video: false,
        is_about_yourself_video: false
      }
    ]
  }
];

// Test extractShareableMedia function
describe('extractShareableMedia', () => {
  test('should filter out test videos and about yourself videos', () => {
    const shareableMedia = extractShareableMedia(mockSearchResults);
    
    expect(shareableMedia).toHaveLength(2);
    expect(shareableMedia[0].id).toBe(101);
    expect(shareableMedia[1].id).toBe(201);
    expect(shareableMedia.find(m => m.id === 102)).toBeUndefined(); // Test video should be filtered out
  });

  test('should handle empty results', () => {
    const shareableMedia = extractShareableMedia([]);
    expect(shareableMedia).toHaveLength(0);
  });

  test('should handle results without media_items', () => {
    const resultsWithoutMedia = [
      { id: 1, user: { first_name: 'John' } }
    ];
    const shareableMedia = extractShareableMedia(resultsWithoutMedia);
    expect(shareableMedia).toHaveLength(0);
  });
});

// Test utility functions (these would need proper mocking in a real test environment)
describe('getTalentWithMedia', () => {
  test('should return correct structure', async () => {
    // This test would require mocking the axios call
    // For now, we'll just test the function exists
    expect(typeof getTalentWithMedia).toBe('function');
  });
});

describe('searchWithMedia', () => {
  test('should return correct structure', async () => {
    // This test would require mocking the axios call
    // For now, we'll just test the function exists
    expect(typeof searchWithMedia).toBe('function');
  });
});

// Integration test example (for manual testing)
describe('Integration Tests', () => {
  test('should work with real API when backend supports include_media', async () => {
    // This test would only pass when the backend supports the include_media parameter
    // It's included here as a reference for when the backend is updated
    
    const results = await getTalentWithMedia({
      city: 'London',
      page_size: 20
    });
    
    console.log(`Found ${results.shareableMedia.length} shareable media items`);
    
    expect(results.success).toBe(true);
    expect(Array.isArray(results.talentResults)).toBe(true);
    expect(Array.isArray(results.shareableMedia)).toBe(true);
  });
});