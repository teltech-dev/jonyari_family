import { NextResponse } from 'next/server';
import { getAuthConfigOnServer, getFamilyDataOnServer } from '@/utils/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    console.log('Received auth request:', { name });
    
    // Get authentication mode
    const authConfig = await getAuthConfigOnServer();
    const authMode = authConfig.authMode;
    
    // In 'specific' mode, only the configured specific name is allowed
    if (authMode === 'specific') {
      const isValid = name === authConfig.specificName;
      
      console.log('Auth mode: specific, result:', isValid);
      
      if (isValid) {
        const tokenData = JSON.stringify({
          name,
          exp: Date.now() + 24 * 60 * 60 * 1000
        });
        
        const token = Buffer.from(tokenData).toString('base64');
        
        return NextResponse.json({ 
          success: true, 
          token 
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Jonyari: Please enter the correct name' 
      }, { status: 401 });
    }
    
    // In 'all' mode, allow any family member present in the data to login
    const familyData = await getFamilyDataOnServer();
    const allNames = new Set<string>();
    familyData.generations.forEach(generation => {
      generation.people.forEach(person => {
        allNames.add(person.name);
      });
    });
    
    const isValid = allNames.has(name);
    
    console.log('Auth mode: all, result:', isValid);
    
    if (isValid) {
      const tokenData = JSON.stringify({
        name,
        exp: Date.now() + 24 * 60 * 60 * 1000
      });
      
      const token = Buffer.from(tokenData).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Jonyari: Incorrect name' 
    }, { status: 401 });
    
  } catch (error) {
    console.error('Error during validation:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Jonyari: Validation failed, please try again' 
    }, { status: 500 });
  }
} 