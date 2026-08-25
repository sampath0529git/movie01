/**
 * Prefetches a document or asset so the browser downloads it in the background.
 * Call this on `onMouseEnter` for links/movie cards to make the next page feel instant.
 */
export const prefetchNextRoute = (url: string) => {
    if (typeof window === 'undefined') return;
  
    // Check if the user has data saver on; if so, don't prefetch to save their data.
    const connection = (navigator as any).connection;
    if (connection && (connection.saveData || connection.effectiveType?.includes('2g'))) {
      return;
    }
  
    // Avoid duplicate prefetch tags
    if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) {
      return;
    }
  
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
};
