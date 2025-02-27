export async function getEnrollCoursesFromIds(courses = []) {
  try {
    // Check if the courses array is empty
    if (!courses.length) {
      throw new Error("No courses provided.");
    }

    // Fetch course details for each courseId
    const courseDetailsPromises = courses.map(async ({ courseId }) => {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: "GET",
        });

        if (!response.ok) {
          // Log error response for better debugging
          const errorText = await response.text();
          console.error(
            `Error fetching course with ID: ${courseId}`,
            errorText
          );
          throw new Error(`Failed to fetch course with ID: ${courseId}`);
        }

        return await response.json(); // Return the parsed JSON course data
      } catch (error) {
        console.error(`Fetch error for course ID ${courseId}:`, error);
        return null; // Return null to keep other fetches from failing
      }
    });

    // Wait for all promises to resolve
    const courseDetails = await Promise.all(courseDetailsPromises);

    // Filter out any null (failed) fetches
    const validCourses = courseDetails.filter((course) => course !== null);

    if (!validCourses.length) {
      throw new Error("No valid courses fetched.");
    }

    return validCourses;
  } catch (error) {
    console.error("Error in getEnrollCoursesFromIds:", error);
    throw error;
  }
}
