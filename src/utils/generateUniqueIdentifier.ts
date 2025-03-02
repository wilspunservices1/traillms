// utils/generateUniqueIdentifier.ts
import { db } from "@/db";
import { user } from "@/db/schemas/user";
import { desc, eq, like } from "drizzle-orm";

const MAX_RETRIES = 5; // Maximum number of attempts to generate a unique identifier

/**
 * Generates a unique identifier based on the user's role.
 * Format: PREFIX-YEAR-SEQUENCE (e.g., INS-2023-00001)
 *
 * @param role - The role of the user ('instructor', 'admin', or default 'user')
 * @returns A unique identifier string
 */
export async function generateUniqueIdentifier(role: string): Promise<string> {
  let uniqueIdentifier = '';
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    attempts += 1;

    // Determine the prefix based on the role
    const prefix = role === 'instructor' ? 'INS' : role === 'admin' ? 'ADM' : 'STU';
    const currentYear = new Date().getFullYear();
    const sequenceNumber = await getNextSequenceNumber(prefix, currentYear);

    uniqueIdentifier = `${prefix}-${currentYear}-${String(sequenceNumber).padStart(5, '0')}`;

    try {
      // Attempt to insert a placeholder or use a transaction to reserve the uniqueIdentifier
      // This step depends on your application's specific requirements and database setup
      // For simplicity, we'll check for uniqueness before returning

      // Check if the identifier is unique in the database
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.uniqueIdentifier, uniqueIdentifier))
        .then(res => res[0]);

      if (!existingUser) {
        // Unique identifier found
        return uniqueIdentifier;
      }
    } catch (error) {
      console.error(`Error checking uniqueIdentifier: ${error}`);
      throw new Error("Failed to generate unique identifier.");
    }
  }

  throw new Error("Unable to generate a unique identifier after multiple attempts.");
}

/**
 * Retrieves the next sequence number for a given prefix and year.
 *
 * @param prefix - The prefix based on the user's role
 * @param year - The current year
 * @returns The next sequence number as a number
 */
async function getNextSequenceNumber(prefix: string, year: number): Promise<number> {
  try {
    // Define the pattern for the uniqueIdentifier
    const pattern = `${prefix}-${year}-%`;

    // Fetch the latest user with the given prefix and year
    const latestUser = await db
      .select()
      .from(user)
      .where(like(user.uniqueIdentifier, pattern))
      .orderBy(desc(user.uniqueIdentifier))
      .limit(1)
      .then(res => res[0]);

    if (latestUser && latestUser.uniqueIdentifier) {
      const parts = latestUser.uniqueIdentifier.split('-');
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) {
        return lastSequence + 1;
      }
    }

    return 1; // Start from 1 if no users found or parsing failed
  } catch (error) {
    console.error(`Error fetching latest sequence number: ${error}`);
    throw new Error("Failed to retrieve the next sequence number.");
  }
}
