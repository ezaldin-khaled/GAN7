import React, { useState } from 'react';
import { getTalentWithMedia, searchWithMedia } from '../../api/searchUtils';

/**
 * Example component demonstrating the new include_media parameter functionality
 */
const MediaSearchExample = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example 1: Get London talent with all their media
  const getLondonTalentWithMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getTalentWithMedia({
        city: 'London',
        page_size: 20
      });
      
      if (result.success) {
        setResults(result);
        console.log(`Found ${result.talentResults.length} talent profiles`);
        console.log(`Found ${result.shareableMedia.length} shareable media items`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Search for any profile type with media
  const searchAllProfilesWithMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await searchWithMedia({
        profile_type: 'talent',
        query: 'actor',
        page_size: 10
      });
      
      if (result.success) {
        setResults(result);
        console.log(`Found ${result.results.length} profiles`);
        console.log(`Found ${result.shareableMedia.length} shareable media items`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Media Search Examples</h2>
      <p>This component demonstrates how to use the new <code>include_media</code> parameter.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Example 1: Get London Talent with Media</h3>
        <button 
          onClick={getLondonTalentWithMedia}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Loading...' : 'Get London Talent'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Example 2: Search All Profiles with Media</h3>
        <button 
          onClick={searchAllProfilesWithMedia}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Search Profiles'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {results && (
        <div>
          <h3>Results</h3>
          <div style={{ marginBottom: '20px' }}>
            <strong>Total Profiles:</strong> {results.talentResults?.length || results.results?.length || 0}
          </div>
          <div style={{ marginBottom: '20px' }}>
            <strong>Shareable Media Items:</strong> {results.shareableMedia?.length || 0}
          </div>
          
          {results.shareableMedia && results.shareableMedia.length > 0 && (
            <div>
              <h4>Shareable Media Preview:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {results.shareableMedia.slice(0, 6).map((media) => (
                  <div key={media.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {media.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Type: {media.media_type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      ID: {media.id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>API Usage Examples</h3>
        <pre style={{ backgroundColor: '#f1f3f4', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
{`// Example 1: Get talent with media in one request
const getTalentWithMedia = async (searchParams) => {
    const params = {
        ...searchParams,
        include_media: 'true'
    };
    
    const response = await fetch(\`/api/dashboard/search/?\${new URLSearchParams(params)}\`);
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

// Example 2: Get London talent with all their media
const results = await getTalentWithMedia({
    profile_type: 'talent',
    city: 'London',
    page_size: 20
});

console.log(\`Found \${results.shareableMedia.length} shareable media items\`);`}
        </pre>
      </div>
    </div>
  );
};

export default MediaSearchExample; 