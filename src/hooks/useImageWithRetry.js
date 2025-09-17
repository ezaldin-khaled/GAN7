import { useState, useEffect } from 'react';


const useImageWithRetry = (imageUrl, maxRetries = 5) => {
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setImageSrc(null);
      setUseFallback(true);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let retryTimeout;

    const loadImage = (url, retryAttempt = 0) => {
      if (!isMounted) return;

      setIsLoading(true);
      setUseFallback(false);
      const img = new Image();

      // Add cache busting for new uploads
      const cacheBustedUrl = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`;

      img.onload = () => {
        if (isMounted) {
          setImageSrc(cacheBustedUrl);
          setIsLoading(false);
          setRetryCount(0);
          setUseFallback(false);
        }
      };

      img.onerror = () => {
        if (isMounted) {
          console.warn(`Failed to load image: ${cacheBustedUrl}, attempt ${retryAttempt + 1}/${maxRetries}`);
          
          if (retryAttempt < maxRetries - 1) {
            // Retry after a short delay (exponential backoff)
            const delay = Math.min(1000 * Math.pow(2, retryAttempt), 5000);
            retryTimeout = setTimeout(() => {
              if (isMounted) {
                setRetryCount(retryAttempt + 1);
                loadImage(url, retryAttempt + 1);
              }
            }, delay);
          } else {
            // Max retries reached, use solid color fallback
            console.error(`Failed to load image after ${maxRetries} attempts: ${cacheBustedUrl}`);
            setImageSrc(null);
            setUseFallback(true);
            setIsLoading(false);
            setRetryCount(0);
          }
        }
      };

      img.src = cacheBustedUrl;
    };

    loadImage(imageUrl);

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [imageUrl, maxRetries]);

  return { imageSrc, isLoading, retryCount, useFallback };
};

export default useImageWithRetry; 