import { NextResponse } from 'next/server';

export async function saveCertificateDesign(designData: any) {
  try {
    const response = await fetch('/api/certificates/design', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(designData),
    });

    if (!response.ok) {
      throw new Error('Failed to save certificate design');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving certificate design:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Here you would typically save to your database
    // For now, we'll just return the data
    return NextResponse.json({ 
      success: true, 
      message: 'Certificate design saved successfully',
      data 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to save certificate design' },
      { status: 500 }
    );
  }
} 