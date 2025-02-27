import { NextResponse } from 'next/server';
import { db } from '@/db';
import { questionnaires } from '@/db/schemas/questionnaire';
import { questions } from '@/db/schemas/questions';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET handler to fetch all questionnaires
export async function GET() {
    try {
        const allQuestionnaires = await db
            .select()
            .from(questionnaires)
            .orderBy(desc(questionnaires.createdAt));

        const formattedQuestionnaires = await Promise.all(
            allQuestionnaires.map(async (q) => {
                const questionsList = await db
                    .select()
                    .from(questions)
                    .where(eq(questions.questionnaireId, q.id));

                console.log('Questions for questionnaire:', questionsList); // Log questions

                return {
                    id: q.id,
                    title: q.title,
                    description: q.description,
                    createdAt: q.createdAt.toISOString(),
                    questionsCount: questionsList.length,
                    status: q.status,
                    questions: questionsList.map(q => ({
                        id: q.id,
                        question: q.question,
                        options: JSON.parse(q.options),
                        correct_answer: q.correct_answer // ✅ Ensure correct_answer is used
                      }))
                };
            })
        );

        return NextResponse.json({
            questionnaires: formattedQuestionnaires
        });
    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questionnaires', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE handler to delete a questionnaire
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
  
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
  
    try {
      // Start a transaction
      await db.transaction(async (tx) => {
        // First, delete associated questions
        await tx.delete(questions).where(eq(questions.questionnaireId, id));
  
        // Then, delete the questionnaire
        const result = await tx.delete(questionnaires).where(eq(questionnaires.id, id));
  
        if (result.rowCount === 0) {
          throw new Error('Questionnaire not found');
        }
      });
  
      return NextResponse.json({ success: true, message: 'Questionnaire deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete questionnaire', 
        details: error.message 
      }, { status: 500 });
    }
  }

