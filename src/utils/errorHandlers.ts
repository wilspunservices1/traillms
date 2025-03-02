// src/utils/errorHandlers.js

import { NextResponse } from "next/server";

// Utility function to handle filter-related errors
export function handleFilterErrors(query) {
  if (!query || query.length === 0) {
    throw new Error("No results found matching the provided filters.");
  }
}

// Utility function to handle query errors
export function handleQueryError(error) {
  return NextResponse.json(
    { message: "Error fetching data.", error: error.message },
    { status: 500 }
  );
}
