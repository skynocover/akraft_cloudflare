/**
 * Azure Content Safety API Helper
 * https://learn.microsoft.com/en-us/azure/ai-services/content-safety/
 */

const API_VERSION = '2023-10-01';

// Content Safety categories
export type SafetyCategory = 'Hate' | 'SelfHarm' | 'Sexual' | 'Violence';

export interface CategoryAnalysis {
  category: SafetyCategory;
  severity: number; // 0-6, where 0 is safe and 6 is most severe
}

export interface TextAnalysisResult {
  categoriesAnalysis: CategoryAnalysis[];
  blocklistsMatch?: { blocklistName: string; blocklistItemId: string; blocklistItemText: string }[];
}

export interface ImageAnalysisResult {
  categoriesAnalysis: CategoryAnalysis[];
}

export interface SafetyCheckResult {
  safe: boolean;
  blockedCategories: SafetyCategory[];
  details: CategoryAnalysis[];
  error?: string;
}

// Severity threshold for blocking content (0-6)
// 2 = Low severity, 4 = Medium severity, 6 = High severity
const DEFAULT_SEVERITY_THRESHOLD = 2;

/**
 * Check if content safety is configured
 */
export function isContentSafetyEnabled(endpoint?: string, apiKey?: string): boolean {
  return !!(endpoint && apiKey);
}

/**
 * Analyze text content for safety
 */
export async function analyzeText(
  endpoint: string,
  apiKey: string,
  text: string,
  severityThreshold: number = DEFAULT_SEVERITY_THRESHOLD
): Promise<SafetyCheckResult> {
  if (!text || text.trim().length === 0) {
    return { safe: true, blockedCategories: [], details: [] };
  }

  try {
    const url = `${endpoint}/contentsafety/text:analyze?api-version=${API_VERSION}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 10000), // API limit
        categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
        outputType: 'FourSeverityLevels',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Content Safety API error:', response.status, errorText);
      // If API fails, allow content through (fail-open)
      return { safe: true, blockedCategories: [], details: [], error: `API error: ${response.status}` };
    }

    const result: TextAnalysisResult = await response.json();
    const blockedCategories: SafetyCategory[] = [];

    for (const analysis of result.categoriesAnalysis) {
      if (analysis.severity >= severityThreshold) {
        blockedCategories.push(analysis.category);
      }
    }

    return {
      safe: blockedCategories.length === 0,
      blockedCategories,
      details: result.categoriesAnalysis,
    };
  } catch (error) {
    console.error('Content Safety check failed:', error);
    // Fail-open: if the safety check fails, allow content through
    return { safe: true, blockedCategories: [], details: [], error: String(error) };
  }
}

/**
 * Analyze image content for safety
 */
export async function analyzeImage(
  endpoint: string,
  apiKey: string,
  imageData: ArrayBuffer,
  severityThreshold: number = DEFAULT_SEVERITY_THRESHOLD
): Promise<SafetyCheckResult> {
  if (!imageData || imageData.byteLength === 0) {
    return { safe: true, blockedCategories: [], details: [] };
  }

  try {
    const url = `${endpoint}/contentsafety/image:analyze?api-version=${API_VERSION}`;

    // Convert ArrayBuffer to base64
    const base64Image = arrayBufferToBase64(imageData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': apiKey,
      },
      body: JSON.stringify({
        image: {
          content: base64Image,
        },
        categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence'],
        outputType: 'FourSeverityLevels',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Content Safety Image API error:', response.status, errorText);
      // If API fails, allow content through (fail-open)
      return { safe: true, blockedCategories: [], details: [], error: `API error: ${response.status}` };
    }

    const result: ImageAnalysisResult = await response.json();
    const blockedCategories: SafetyCategory[] = [];

    for (const analysis of result.categoriesAnalysis) {
      if (analysis.severity >= severityThreshold) {
        blockedCategories.push(analysis.category);
      }
    }

    return {
      safe: blockedCategories.length === 0,
      blockedCategories,
      details: result.categoriesAnalysis,
    };
  } catch (error) {
    console.error('Content Safety image check failed:', error);
    // Fail-open: if the safety check fails, allow content through
    return { safe: true, blockedCategories: [], details: [], error: String(error) };
  }
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Combined check for both text and image
 */
export async function checkContentSafety(
  endpoint: string,
  apiKey: string,
  options: {
    text?: string;
    imageData?: ArrayBuffer;
    severityThreshold?: number;
  }
): Promise<SafetyCheckResult> {
  const { text, imageData, severityThreshold = DEFAULT_SEVERITY_THRESHOLD } = options;
  const results: SafetyCheckResult[] = [];

  // Check text if provided
  if (text) {
    const textResult = await analyzeText(endpoint, apiKey, text, severityThreshold);
    results.push(textResult);
  }

  // Check image if provided
  if (imageData) {
    const imageResult = await analyzeImage(endpoint, apiKey, imageData, severityThreshold);
    results.push(imageResult);
  }

  // Combine results
  const allBlockedCategories = new Set<SafetyCategory>();
  const allDetails: CategoryAnalysis[] = [];
  const errors: string[] = [];

  for (const result of results) {
    for (const category of result.blockedCategories) {
      allBlockedCategories.add(category);
    }
    allDetails.push(...result.details);
    if (result.error) {
      errors.push(result.error);
    }
  }

  return {
    safe: allBlockedCategories.size === 0,
    blockedCategories: Array.from(allBlockedCategories),
    details: allDetails,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}
