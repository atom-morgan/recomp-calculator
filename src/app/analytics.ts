import { GA_MEASUREMENT_ID } from './config';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// skip local dev so testing doesn't show up as real visits
const enabled = () => !!GA_MEASUREMENT_ID && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname);

export function initAnalytics() {
  if (!enabled()) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  // gtag.js expects the arguments object itself, not an array
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}

// Don't pass anything the user typed in (weight, body fat): GA's terms
// forbid personal data, and health details shouldn't leave the browser.
export function track(event: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.('event', event, params);
}
