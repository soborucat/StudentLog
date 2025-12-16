import { FormConfig, SubmissionData } from '../types';

/**
 * Parses a pre-filled Google Form URL to extract the base action URL and entry IDs.
 */
export const parsePrefilledUrl = (url: string): Partial<FormConfig> | null => {
  try {
    const urlObj = new URL(url);
    
    // Extract base URL and convert 'viewform' to 'formResponse'
    let baseUrl = urlObj.origin + urlObj.pathname;
    if (baseUrl.endsWith('/viewform')) {
      baseUrl = baseUrl.replace('/viewform', '/formResponse');
    } else if (baseUrl.endsWith('/prefill')) {
        baseUrl = baseUrl.replace('/prefill', '/formResponse');
    }

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
 */
export const submitToGoogleForm = async (config: FormConfig, data: SubmissionData): Promise<boolean> => {
  const params = new URLSearchParams();
  
  params.append(config.studentIdEntry, data.studentId);
  params.append(config.typeEntry, data.type);
  params.append(config.reasonEntry, data.reason);

  // If guardian entry is configured and checked, send the confirmation string
  if (config.guardianEntry && data.guardianChecked) {
      params.append(config.guardianEntry, "보호자 확인했습니다.");
  }

  const fullUrl = `${config.formUrl}?${params.toString()}`;

  try {
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