import { FamilyData } from '../types/family';

// Define configuration types
export interface AuthConfig {
  requireAuth: boolean;
  authMode: 'all' | 'specific';
  specificName: string;
  familyName: string;
}

// Public config type exposed to client (no sensitive info)
export interface PublicConfig {
  familyName: string;
  isAuthRequired: boolean; // expose only whether auth is required (no sensitive details)
}

// Default empty family data
const defaultFamilyData: FamilyData = {
  generations: []
};

// Cached config data
let authConfigCache: AuthConfig | null = null;
let familyDataCache: FamilyData | null = null;

// Load configuration file on the server
async function loadConfigOnServer<T>(filename: string, defaultConfig: T): Promise<T> {
  // Check if running on server
  if (typeof window !== 'undefined') {
    console.warn(`Cannot load ${filename} in browser environment, using default config`);
    return defaultConfig;
  }

  try {
    // Dynamically import fs and path modules (server only)
    const [fs, path] = await Promise.all([
      import('fs').then(m => m.default),
      import('path').then(m => m.default)
    ]);
    
    const configDir = path.join(process.cwd(), 'config');
    const filePath = path.join(configDir, filename);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as T;
    }
  } catch (error) {
    console.warn(`Error loading config file ${filename}:`, error);
  }
  
  return defaultConfig;
}

// Read server-side auth configuration from environment variables
function getAuthConfigOnServerFromEnv(): AuthConfig {
  return {
    requireAuth: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true',
    authMode: (process.env.AUTH_MODE as 'all' | 'specific') || 'specific',
    specificName: process.env.SPECIFIC_NAME || '',
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || 'Surname'
  };
}

// Read client-public configuration from environment variables
function getPublicConfigFromEnv(): PublicConfig {
  return {
    familyName: process.env.NEXT_PUBLIC_FAMILY_NAME || 'Surname',
    isAuthRequired: process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'
  };
}

// Export config accessors - intended for server-side components
export async function getAuthConfigOnServer(): Promise<AuthConfig> {
  if (authConfigCache) return authConfigCache;
  
  // Read config directly from environment variables
  const config = getAuthConfigOnServerFromEnv();
  authConfigCache = config;
  return config;
}

// For client usage: return full family display name (adds a Family suffix)
export function getFamilyFullName(): string {
  const config = getPublicConfigFromEnv();
  // Override the family display name to the user's requested dialect 'Jonyari'
  return 'Jonyari';
}

export async function getFamilyDataOnServer(): Promise<FamilyData> {
  if (familyDataCache) return familyDataCache;
  
  const raw = await loadConfigOnServer<any>('family-data.json', defaultFamilyData);

  // Normalize older file format that used `generation` instead of `generations`
  let data: FamilyData = raw;
  if (!Array.isArray(raw.generations) && Array.isArray(raw.generation)) {
    data = { generations: raw.generation };
  }

  if (!Array.isArray(data.generations)) {
    data = { generations: [] };
  }

  familyDataCache = data;
  return data;
}

// Client-public config (only includes safe-to-expose info)
export function getPublicConfig(): PublicConfig {
  return getPublicConfigFromEnv();
}

// For familyData we fetch via API (might be large), provide default placeholder
export function getFamilyData(): FamilyData {
  return defaultFamilyData; // default placeholder; real data comes from API
}