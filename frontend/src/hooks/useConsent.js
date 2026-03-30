import { useState, useEffect } from 'react';

const CONSENT_KEY = 'onehorizon_gdpr_consent';

export function useConsent() {
  const [consent, setConsent] = useState(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // null means no choice made yet
  });

  const saveConsent = async (preferences) => {
    // Save to local storage
    localStorage.setItem(CONSENT_KEY, JSON.stringify(preferences));
    setConsent(preferences);

    // Try to sync with server
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Convert preferences object to array for API
      const body = [
        { type: 'NECESSARY', value: true, source: 'cookie_banner' },
        { type: 'ANALYTICS', value: !!preferences.analytics, source: 'cookie_banner' },
        { type: 'MARKETING', value: !!preferences.marketing, source: 'cookie_banner' },
      ];

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/gdpr/consent`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.error('Failed to sync consent to server', e);
    }
  };

  return {
    consent,
    saveConsent,
    hasResponded: consent !== null,
    hasAnalytics: consent?.analytics === true,
    hasMarketing: consent?.marketing === true,
  };
}
