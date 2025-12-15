import { FormConfig, SubmissionData } from '../types';

/**
 * Parses a pre-filled Google Form URL to extract the base action URL and entry IDs.
 * Example URL: https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform?usp=pp_url&entry.12345=ID&entry.67890=TYPE&entry.11111=REASON
 */
export const parsePrefilledUrl = (url: string): Partial<FormConfig> | null => {
  try {
    const urlObj = new URL(url);
    
    // Extract base URL and convert 'viewform' to 'formResponse'
    // This is required for headless submission
    let baseUrl = urlObj.origin + urlObj.pathname;
    if (baseUrl.endsWith('/viewform')) {
      baseUrl = baseUrl.replace('/viewform', '/formResponse');
    } else if (baseUrl.endsWith('/prefill')) {
        baseUrl = baseUrl.replace('/prefill', '/formResponse');
    }

    const entries: string[] = [];
    urlObj.searchParams.forEach((_, key) => {
      if (key.startsWith('entry.')) {
        entries.push(key);
      }
    });

    // We return the found entries. The UI will have to ask the user to map them
    // because we can't know for sure which is which, although we can guess by order.
    return {
      formUrl: baseUrl,
    };
  } catch (e) {
    console.error("Error parsing URL", e);
    return null;
  }
};

/**
 * Extracts all entry keys from a URLSearchParams object.
 */
export const extractEntryKeys = (url: string): string[] => {
    try {
        const urlObj = new URL(url);
        const keys: string[] = [];
        urlObj.searchParams.forEach((_, key) => {
            if (key.startsWith('entry.')) {
                keys.push(key);
            }
        });
        return keys;
    } catch (e) {
        return [];
    }
}

/**
 * Submits data to Google Forms using no-cors mode.
 * Note: We cannot read the response in no-cors mode, so we assume success if no network error throws.
 */
export const submitToGoogleForm = async (config: FormConfig, data: SubmissionData): Promise<boolean> => {
  const params = new URLSearchParams();
  
  params.append(config.studentIdEntry, data.studentId);
  params.append(config.typeEntry, data.type);
  params.append(config.reasonEntry, data.reason);

  const fullUrl = `${config.formUrl}?${params.toString()}`;

  try {
    // We use no-cors because Google Forms does not allow CORS requests from random domains.
    // This means the browser will send the request, but our JS code won't see the response body/status.
    // However, the form entry WILL be recorded in the Google Sheet/Form.
    await fetch(fullUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return true;
  } catch (error) {
    console.error("Submission failed", error);
    return false;
  }
};