import { db } from '@/db'; // Import your Drizzle ORM DB instance
import { lectures } from '@/db/schemas/lectures'; // Import the lectures schema

export async function GET() {
  try {
    // Fetch only the id field for all lessons (lectures)
    const lessons = await db.select({ id: lectures.id }).from(lectures);

    // Return the lessons with only id as JSON
    return new Response(JSON.stringify(lessons), { status: 200 });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return new Response(JSON.stringify({ message: 'Failed to fetch lessons' }), { status: 500 });
  }
}


// // Create the /api/lessons endpoint to return all lessons

// import { db } from '@/db'; // Import your Drizzle ORM DB instance
// import { lectures } from '@/db/schemas/lectures'; // Import the lectures schema

// export async function GET() {
//   try {
//     // Fetch all lessons (lectures)
//     const lessons = await db.select().from(lectures);

//     // Return the lessons as JSON
//     return new Response(JSON.stringify(lessons), { status: 200 });
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     return new Response(JSON.stringify({ message: 'Failed to fetch lessons' }), { status: 500 });
//   }
// }
