import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from "@/libs/uploadinary/upload"; // Adjust the path to your upload function

export async function POST(req: NextRequest) {
  try {
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Convert the file to a buffer
    const fileBuffer = await file.arrayBuffer();

    // Get the MIME type and convert to base64
    const mimeType = file.type;
    const encoding = "base64";
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    // Create the data URI for Cloudinary
    const fileUri = `data:${mimeType};${encoding},${base64Data}`;

    // Upload the file to Cloudinary
    const res = await uploadToCloudinary(fileUri, file.name);

    if (res.success && res.result) {
      return NextResponse.json({ 
        message: "success", 
        imgUrl: res.result.secure_url 
      });
    } else {
      return NextResponse.json({ 
        message: "failure", 
        error: res ,
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    return NextResponse.json({ 
      message: "An error occurred during file upload", 
      error: error.message 
    }, { status: 500 });
  }
}



// import { NextRequest, NextResponse } from 'next/server';
// import { createWriteStream, existsSync, mkdirSync } from 'fs';
// import { join } from 'path';
// import { Readable } from 'stream';

// async function upload(request) {
//   const formData = await request.formData();
//   const file = formData.get("file") ;
//   const userId = formData.get("userId");
//   const slug = formData.get("slug");

//   if (!file || !userId || !slug) {
//     console.error("Missing file, userId, or slug.");
//     return false;
//   }

//   const uploadDir = join(process.cwd(), 'public/uploads', userId);
//   if (!existsSync(uploadDir)) {
//     mkdirSync(uploadDir, { recursive: true });
//   }

//   const fileName = file.name || `${slug}.${file.type.split('/')[1]}`; // Default to slug if file name is missing
//   const filePath = join(uploadDir, fileName);

//   const fileStream = createWriteStream(filePath);
//   const fileReadableStream = new Readable();
//   fileReadableStream._read = () => {};
  
//   const buffer = await file.arrayBuffer();
//   fileReadableStream.push(Buffer.from(buffer));
//   fileReadableStream.push(null);

//   return new Promise<string | false>((resolve, reject) => {
//     fileReadableStream
//       .pipe(fileStream)
//       .on("error", (error) => {
//         console.error("Error while saving the file:", error);
//         resolve(false);
//       })
//       .on("finish", () => {
//         console.log("File saved successfully at:", filePath);
//         resolve(`/uploads/${userId}/${fileName}`);
//       });
//   });
// }

// export const POST = async (request) => {
//   const path = await upload(request);

//   if (!path) {
//     return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
//   }

//   return NextResponse.json({ message: "File uploaded successfully", path });
// };



// import { NextRequest, NextResponse } from 'next/server';
// import { createWriteStream, existsSync, mkdirSync } from 'fs';
// import { join } from 'path';
// import { Readable } from 'stream';

// async function upload(request: NextRequest) {
//   const formData = await request.formData();

//   return new Promise((resolve, reject) => {
//     const file = formData.get("file") as File;
//     const userId = formData.get("userId") as string;
//     const slug = formData.get("slug") as string;

//     if (!file || !userId || !slug) {
//       console.error("Missing file, userId, or slug.");
//       resolve(false);
//       return;
//     }

//     const uploadDir = join(process.cwd(), 'public/uploads', userId);

//     // Ensure the user-specific directory exists
//     if (!existsSync(uploadDir)) {
//       mkdirSync(uploadDir, { recursive: true });
//     }

//     const extension = file.name.split('.').pop();
//     const filename = `${slug}.${extension}`;
//     const filePath = join(uploadDir, filename);

//     const fileStream = createWriteStream(filePath);
//     const fileReadableStream = new Readable();
//     fileReadableStream._read = () => {};

//     file.arrayBuffer().then((buffer) => {
//       fileReadableStream.push(Buffer.from(buffer));
//       fileReadableStream.push(null);

//       fileReadableStream
//         .pipe(fileStream)
//         .on("error", (error) => {
//           console.error("Error while saving the file:", error);
//           resolve(false);
//         })
//         .on("finish", () => {
//           console.log("File saved successfully at:", filePath);
//           resolve(`/uploads/${userId}/${filename}`); // Return the relative path to the file
//         });
//     });
//   });
// }

// export const POST = async function (request: NextRequest) {
//   const path = await upload(request);

//   if (!path) {
//     return NextResponse.json({
//       error: "Failed to save file.",
//     }, { status: 500 });
//   }

//   return NextResponse.json({
//     message: "File uploaded successfully",
//     path,
//   });
// };
