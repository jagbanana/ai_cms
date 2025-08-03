import { useState } from 'react';
import { useAnalytics } from '../utils/analytics';

interface ShareButtonsProps {
  title: string;
  description?: string;
  url: string;
  className?: string;
}

export function ShareButtons({ title, url, className = '' }: ShareButtonsProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const { trackShareClick } = useAnalytics();

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  const openShareWindow = (shareUrl: string, platform: string) => {
    // Track share click
    trackShareClick(platform, title);
    
    const popup = window.open(
      shareUrl,
      'share',
      'width=600,height=400,scrollbars=yes,resizable=yes'
    );
    
    if (popup) {
      popup.focus();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Track copy link action
      trackShareClick('copy-link', title);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const isMobile = className.includes('flex-row');
  
  return (
    <div className={`share-buttons ${className}`}>
      <div className="share-buttons-label text-sm font-medium text-slate-300 mb-3">
        Share
      </div>
      
      <div className={`share-buttons-container flex ${isMobile ? 'flex-row space-x-2' : 'flex-col space-y-2'}`}>
        {/* Twitter/X */}
        <button
          onClick={() => openShareWindow(shareUrls.twitter, 'twitter')}
          className="share-button twitter-share flex items-center justify-center w-12 h-12 bg-chess-dark-secondary hover:bg-chess-dark-tertiary border border-chess-dark-border rounded-full transition-colors group"
          title="Share on Twitter"
          aria-label="Share on Twitter"
        >
          <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => openShareWindow(shareUrls.facebook, 'facebook')}
          className="share-button facebook-share flex items-center justify-center w-12 h-12 bg-chess-dark-secondary hover:bg-chess-dark-tertiary border border-chess-dark-border rounded-full transition-colors group"
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => openShareWindow(shareUrls.linkedin, 'linkedin')}
          className="share-button linkedin-share flex items-center justify-center w-12 h-12 bg-chess-dark-secondary hover:bg-chess-dark-tertiary border border-chess-dark-border rounded-full transition-colors group"
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </button>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="share-button copy-link flex items-center justify-center w-12 h-12 bg-chess-dark-secondary hover:bg-chess-dark-tertiary border border-chess-dark-border rounded-full transition-colors group relative"
          title="Copy link"
          aria-label="Copy link"
        >
          {copySuccess ? (
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-slate-300 group-hover:text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          )}
          
          {copySuccess && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              Copied!
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

export default ShareButtons;