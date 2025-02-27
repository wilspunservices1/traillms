
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/db";
import { files } from "@/db/schemas/files";

// export const config = {
//   api: {
//     bodyParser: false, // Disable body parsing to handle raw data manually
//   },
// };


export async function POST(req: NextRequest) {
  try {
    console.log("Received POST request...");

    const formData = await req.formData();
    console.log("Form data parsed...");

    const file = formData.get("file");
    const courseId = formData.get("courseId") || null;

    if (!file || !(file instanceof File)) {
      console.log("No file uploaded or file is not an instance of File.");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("File received:", file.name);
    console.log("File size:", file.size);
    console.log("File type:", file.type);

    // Define the upload directory and ensure it exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    console.log("Upload directory:", uploadDir);

    if (!fs.existsSync(uploadDir)) {
      console.log("Upload directory does not exist. Creating it...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file to the upload directory
    const filePath = path.join(uploadDir, file.name);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log("Writing file to:", filePath);
    fs.writeFileSync(filePath, fileBuffer);

    console.log("File saved successfully to:", filePath);

    // Relative path for client
    const relativePath = path.join("/uploads", file.name);

    // Insert file information into the database
    await db.insert(files).values({
      name: file.name,
      path: filePath,
      size: file.size,
      courseId: courseId || undefined,
    });

    console.log("File information saved to database.");

    return NextResponse.json(
      { message: "File uploaded successfully", filePath: relativePath },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "File upload error", details: error.message },
      { status: 500 }
    );
  }
}


// working api to upload vedio locally
// export async function POST(req: NextRequest) {
//   try {
//     console.log("Received POST request...");

//     const formData = await req.formData();
//     console.log("Form data parsed...");

//     const file = formData.get("file");
//     const courseId = formData.get("courseId") || null;

//     if (!file || !(file instanceof File)) {
//       console.log("No file uploaded or file is not an instance of File.");
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     console.log("File received:", file.name);
//     console.log("File size:", file.size);
//     console.log("File type:", file.type);

//     // Define the upload directory and ensure it exists
//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     console.log("Upload directory:", uploadDir);

//     if (!fs.existsSync(uploadDir)) {
//       console.log("Upload directory does not exist. Creating it...");
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // Save the file to the upload directory
//     const filePath = path.join(uploadDir, file.name);
//     const fileBuffer = Buffer.from(await file.arrayBuffer());

//     console.log("Writing file to:", filePath);
//     fs.writeFileSync(filePath, fileBuffer);

//     console.log("File saved successfully to:", filePath);

//     // Insert file information into the database
//     await db.insert(files).values({
//       name: file.name,
//       path: filePath,
//       size: file.size,
//       courseId: courseId || undefined,
//     });

//     console.log("File information saved to database.");

//     return NextResponse.json(
//       { message: "File uploaded successfully", filePath },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return NextResponse.json(
//       { error: "File upload error", details: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function GET() {
  console.log("GET request received. API is working.");
  return NextResponse.json({ message: "API route is working!" });
}


// import { NextRequest, NextResponse } from "next/server";
// import fs from "fs";
// import path from "path";
// import { db } from "@/db";
// import { files } from "@/db/schemas/files";

// export const config = {
//   api: {
//     bodyParser: false, // Disable body parsing to handle raw data manually
//   },
// };

// export async function POST(req: NextRequest) {
//   try {
//     console.log("Received POST request...");

//     const formData = await req.formData();
//     const file = formData.get("file");
//     const courseId = formData.get("courseId") || null;

//     if (!file || !(file instanceof File)) {
//       console.log("No file uploaded.");
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     console.log("File received:", file.name);
//     console.log("File size:", file.size);
//     console.log("File type:", file.type);

//     // Define the upload directory and ensure it exists
//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }

//     // Save the file to the upload directory
//     const filePath = path.join(uploadDir, file.name);
//     const fileBuffer = Buffer.from(await file.arrayBuffer());
//     fs.writeFileSync(filePath, fileBuffer);

//     console.log("File saved to:", filePath);

//     // Insert file information into the database
//     await db.insert(files).values({
//       name: file.name,
//       path: filePath,
//       size: file.size,
//       courseId: courseId || undefined,
//     });

//     return NextResponse.json(
//       { message: "File uploaded successfully", filePath },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return NextResponse.json(
//       { error: "File upload error", details: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   console.log("GET request received. API is working.");
//   return NextResponse.json({ message: "API route is working!" });
// }
