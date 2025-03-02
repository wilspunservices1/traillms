import { NextResponse } from 'next/server';
import { db } from '@/db';  // Adjust the path based on your project structure
import { courses } from '@/db/schemas/courses';
import { chapters } from '@/db/schemas/courseChapters';
import { lectures } from '@/db/schemas/lectures';


// Function to handle the GET request
export async function GET(req: Request) {
  // Extract the query parameters
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');  // Get userId from the query params

  // Check if userId is passed
  if (!userId) {
    return NextResponse.json({ error: 'userId is required as a query parameter' }, { status: 400 });
  }

  try {
    // Insert Full Stack Developer course
    const courseData = {
      title: "Full Stack Engineer",
      slug: "full-stack-engineer",
      lesson: "Introduction to Full Stack Development",
      duration: "50 hours",
      description: "Comprehensive course on becoming a full stack developer",
      featured: true,
      price: 299.99,
      estimatedPrice: 499.99,
      isFree: false,
      tag: "Full Stack",
      skillLevel: "Intermediate",
      categories: ['Development', 'Web', 'Full Stack'],
      insName: "Aqeel Shahzad",
      thumbnail: "https://res.cloudinary.com/ddj5gisb3/image/upload/v1725361134/courses/images_otkprf.jpg",
      userId,  // Use the userId from query params
      demoVideoUrl: "D:\\lms\\public\\uploads\\full-stack-intro.mp4",
      isPublished: true,
    };

    const [newCourse] = await db.insert(courses).values(courseData).returning();
    console.log('Course inserted successfully:', newCourse);

    // Insert chapters for Full Stack Developer course
    const chaptersData = [
      {
        courseId: newCourse.id,
        title: "Introduction to Full Stack Development",
        description: "Overview of Full Stack Development and its importance",
        order: "1",
        duration: "2 hours"
      },
      {
        courseId: newCourse.id,
        title: "Frontend Basics: HTML, CSS, JavaScript",
        description: "Learn the fundamentals of frontend development",
        order: "2",
        duration: "8 hours"
      },
      {
        courseId: newCourse.id,
        title: "Backend Basics: Node.js and Express",
        description: "Understanding backend development with Node.js and Express",
        order: "3",
        duration: "10 hours"
      },
      {
        courseId: newCourse.id,
        title: "Databases: SQL & NoSQL",
        description: "Introduction to database technologies",
        order: "4",
        duration: "10 hours"
      },
      {
        courseId: newCourse.id,
        title: "Full Stack Project: Building a Web Application",
        description: "Hands-on project to build a full stack web application",
        order: "5",
        duration: "20 hours"
      }
    ];

    const insertedChapters = await db.insert(chapters).values(chaptersData).returning();
    console.log('Chapters inserted successfully:', insertedChapters);

    // Insert lectures for each chapter
    const lectureData = insertedChapters.flatMap((chapter, index) => {
      return Array.from({ length: 5 }).map((_, i) => ({
        chapterId: chapter.id,
        title: `Lecture ${i + 1} for ${chapter.title}`,
        description: `In-depth details for lecture ${i + 1} in ${chapter.title}`,
        duration: "1 hour",
        videoUrl: "D:\\lms\\public\\uploads\\full-stack-lecture.mp4", // Placeholder, replace with actual videos
        isPreview: i === 0, // First lecture is a preview
        isLocked: i !== 0, // All lectures except the first are locked
        order: `${index + 1}.${i + 1}`,
      }));
    });

    await db.insert(lectures).values(lectureData);
    console.log('Lectures inserted successfully');

    return NextResponse.json({ message: 'Full Stack Developer course, chapters, and lectures inserted successfully' });
  } catch (error) {
    console.error('Error inserting course, chapters, and lectures:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
