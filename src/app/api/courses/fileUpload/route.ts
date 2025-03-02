import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { files } from "@/db/schemas/files";


// API route for multiple file uploads
export async function POST(req: NextRequest) {
  try {
    console.log("Received POST request...");

    const formData = await req.formData();
    console.log("Form data parsed...");

    // Get the files and courseId from formData
    const fileList = formData.getAll("files");
    const courseId = formData.get("courseId") || null;

    if (!fileList || fileList.length === 0) {
      console.log("No files uploaded.");
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads/files");
    console.log("Upload directory:", uploadDir);

    if (!fs.existsSync(uploadDir)) {
      console.log("Upload directory does not exist. Creating it...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Explicitly define filePaths type as string[]
    const filePaths: string[] = [];

    // Loop through the files and save each one
    for (const file of fileList) {
      if (!(file instanceof File)) {
        console.log("Invalid file in upload.");
        return NextResponse.json({ error: "Invalid file in upload" }, { status: 400 });
      }

      const filePath = path.join(uploadDir, file.name);
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      console.log("Writing file to:", filePath);
      fs.writeFileSync(filePath, fileBuffer);

      console.log("File saved successfully to:", filePath);

      // Save each file path for the response
      filePaths.push(filePath);

      // Insert file information into the database
      await db.insert(files).values({
        name: file.name,
        path: filePath,
        size: file.size,
        courseId: courseId || undefined, // Associate with a course if provided
      });
    }

    console.log("All files uploaded and saved to the database.");

    return NextResponse.json(
      { message: "Files uploaded successfully", filePaths },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      { error: "File upload error", details: error.message },
      { status: 500 }
    );
  }
}
