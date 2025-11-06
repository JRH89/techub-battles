// Check if user is coming from Twitter/X in-app browser
// This file only runs on client side
export function isFromTwitter(): boolean {
  // Only run on client side
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }
  
  try {
    const referrer = document.referrer.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Check referrer for twitter/x.com
    if (referrer.includes('twitter.com') || referrer.includes('x.com')) {
      return true;
    }
    
    // Check user agent for Twitter in-app browser
    if (userAgent.includes('twitter') || userAgent.includes('x.com')) {
      return true;
    }
    
    return false;
  } catch (error) {
    return false;
  }
}
