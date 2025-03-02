import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/libs/auth'; // Your custom getSession import
import { db } from '@/db'; // Assuming your database connection is set up here
import { user } from '@/db/schemas/user'; // Assuming you have the user schema defined in Drizzle

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET handler to fetch all users (admin only)
export async function GET(req: NextRequest) {
  try {
    // Get session from your custom auth configuration
    const session = await getSession();

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if the user has the 'admin' role
    const isAdmin = session.user.roles && session.user.roles.includes('admin');
    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    // Fetch all users from the database
    const allUsers = await db
      .select({
        id: user.id,
        uniqueIdentifier: user.uniqueIdentifier,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image,
        roles: user.roles,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        enrolledCourses: user.enrolledCourses,
      })
      .from(user);

    // If no users found, return a 404 response
    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json({ message: 'No users found.' }, { status: 404 });
    }

    // Modify users to include only the count of enrolled courses
    const usersWithEnrolledCoursesCount = allUsers.map((userData) => ({
      id: userData.id,
      name: userData.name,
      username: userData.username,
      uniqueIdentifier: userData.uniqueIdentifier,
      email: userData.email,
      phone: userData.phone,
      image: userData.image,
      roles: userData.roles,
      isVerified: userData.isVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      enrolledCoursesCount: userData.enrolledCourses ? userData.enrolledCourses.length : 0, // Add only the count
    }));

    // Return all users with the count of enrolled courses
    return NextResponse.json(usersWithEnrolledCoursesCount, { status: 200 });
  } catch (error) {
    console.error('Error fetching all users with courses:', error);
    return NextResponse.json({ error: 'An error occurred while fetching all users.' }, { status: 500 });
  }
}



// import { NextRequest, NextResponse } from 'next/server';
// import { getSession } from '@/libs/auth'; // Your custom getSession import
// import { db } from '@/db'; // Assuming your database connection is set up here
// import { user } from '@/db/schemas/user'; // Assuming you have the user schema defined in Drizzle

// // GET handler to fetch all users (admin only)
// export async function GET(req: NextRequest) {
//   try {
//     // Get session from your custom auth configuration
//     const session = await getSession();

//     // Check if the user is authenticated
//     if (!session || !session.user) {
//       return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//     }

//     // Check if the user has the 'admin' role
//     const isAdmin = session.user.roles && session.user.roles.includes('admin');
//     if (!isAdmin) {
//       return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
//     }

//     // Fetch all users from the database
//     const allUsers = await db
//       .select({
//         id: user.id,
//         name: user.name,
//         username: user.username,
//         email: user.email,
//         phone: user.phone,
//         image: user.image,
//         roles: user.roles,
//         isVerified: user.isVerified,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//         enrolledCourses: user.enrolledCourses,
//       })
//       .from(user);

//     // If no users found, return a 404 response
//     if (!allUsers || allUsers.length === 0) {
//       return NextResponse.json({ message: 'No users found.' }, { status: 404 });
//     }

//     // Modify users to include only the count of enrolled courses
//     const usersWithEnrolledCoursesCount = allUsers.map((userData) => ({
//       id: userData.id,
//       name: userData.name,
//       username: userData.username,
//       email: userData.email,
//       phone: userData.phone,
//       image: userData.image,
//       roles: userData.roles,
//       isVerified: userData.isVerified,
//       createdAt: userData.createdAt,
//       updatedAt: userData.updatedAt,
//       enrolledCoursesCount: userData.enrolledCourses ? userData.enrolledCourses.length : 0, // Add only the count
//     }));

//     // Return all users with the count of enrolled courses
//     return NextResponse.json(usersWithEnrolledCoursesCount, { status: 200 });
//   } catch (error) {
//     console.error('Error fetching all users with courses:', error);
//     return NextResponse.json({ error: 'An error occurred while fetching all users.' }, { status: 500 });
//   }
// }
