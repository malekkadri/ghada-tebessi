declare global {
  interface Window {
    fbq: any;
  }
}

export const initMetaPixel = (pixelId: string) => {
  if (!pixelId) return;

  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
};

export const trackMetaEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, eventData);
  }
};

export const mapToMetaEvent = (eventType: string) => {
  const mapping: Record<string, string> = {
    'view': 'ViewContent',
    'click': 'CustomizeProduct',
    'download': 'Lead',
    'share': 'Share',
    'heartbeat': 'Heartbeat',
    'mouse_move': 'MouseMovement',
    'scroll': 'Scroll',
    'hover': 'Hover',
    'suspicious_activity': 'SuspiciousActivity',
    'preference_updated': 'PreferenceUpdated',
    'attention_event': 'AttentionEvent'
  };
  return mapping[eventType] || 'CustomEvent';
};