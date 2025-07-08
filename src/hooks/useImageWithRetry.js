import { useState, useEffect } from 'react';

const useImageWithRetry = (imageUrl, fallbackUrl = '/assets/default-profile.png', maxRetries = 5) => {
  const [imageSrc, setImageSrc] = useState(imageUrl || fallbackUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!imageUrl) {
      setImageSrc(fallbackUrl);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let retryTimeout;

    const loadImage = (url, retryAttempt = 0) => {
      if (!isMounted) return;

      setIsLoading(true);
      const img = new Image();

      img.onload = () => {
        if (isMounted) {
          setImageSrc(url);
          setIsLoading(false);
          setRetryCount(0);
        }
      };

      img.onerror = () => {
        if (isMounted) {
          console.warn(`Failed to load image: ${url}, attempt ${retryAttempt + 1}/${maxRetries}`);
          
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
            // Max retries reached, use fallback
            console.error(`Failed to load image after ${maxRetries} attempts: ${url}`);
            setImageSrc(fallbackUrl);
            setIsLoading(false);
            setRetryCount(0);
          }
        }
      };

      img.src = url;
    };

    loadImage(imageUrl);

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [imageUrl, fallbackUrl, maxRetries]);

  return { imageSrc, isLoading, retryCount };
};

export default useImageWithRetry; 