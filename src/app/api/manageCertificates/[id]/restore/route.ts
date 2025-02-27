// src/app/api/manageCertificates/[id]/restore/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { getSession } from '@/libs/auth';
import { certification } from '@/db/schemas/certification';
import { eq } from 'drizzle-orm';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized - No valid session' },
                { status: 401 }
            );
        }

        await db
            .update(certification)
            .set({ 
                isDeleted: false, 
                deletedAt: null 
            })
            .where(eq(certification.id, params.id))
            .execute();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error restoring certificate:', error);
        return NextResponse.json(
            { 
                error: 'Failed to restore certificate',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}