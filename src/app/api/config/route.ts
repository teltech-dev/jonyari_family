import { NextResponse } from 'next/server';
import { getAuthConfigOnServer, getFamilyDataOnServer } from '@/utils/config';

// Verify whether a token is valid
async function verifyToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  
  try {
    // Decode token using Buffer
    const tokenData = Buffer.from(token, 'base64').toString();
    const parsedToken = JSON.parse(tokenData);
    const expirationTime = parsedToken.exp;
    const currentTime = Date.now();
    
    // Check if token is expired (24 hours)
    return currentTime < expirationTime;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

export async function GET(request: Request) {
  try {
    // Get query params from the request URL
    const url = new URL(request.url);
    const configType = url.searchParams.get('type');
    
    // Load auth configuration
    const authConfig = await getAuthConfigOnServer();
    
    // If auth is required, check the Authorization header
    if (authConfig.requireAuth) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : null;
      
      // Verify token validity
      const isValidToken = await verifyToken(token);
      
      if (!isValidToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Return different data depending on requested config type
    if (configType === 'auth') {
      // Return only public config (no sensitive info)
      const publicConfig = {
        familyName: authConfig.familyName,
        requireAuth: authConfig.requireAuth
      };
      return NextResponse.json(publicConfig);
    } else if (configType === 'family') {
      const familyData = await getFamilyDataOnServer();
      return NextResponse.json(familyData);
    } else {
      // If no valid type specified, return an error
      return NextResponse.json({ error: 'Invalid config type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 });
  }
} 