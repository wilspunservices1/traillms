import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { placeholders as placeholdersSchema } from "@/db/schemas/placeholders";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/libs/auth";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const PlaceholderSchema = z.object({
  id: z.string().optional(),
  certificate_id: z.string().uuid(),
  key: z.string(),
  discount: z.number().default(0),
  label: z.string(),
  is_visible: z.boolean().default(true),
  font_size: z.number().default(14),
  color: z.string().default("#000000"),
  value: z.string(),
  x: z.number().default(0),
  y: z.number().default(0),
});

const PayloadSchema = z.object({
  placeholders: z.array(PlaceholderSchema),
});

// 📌 **GET Request - Fetch placeholders**
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log("Received request for GET /api/certificates/[id]/placeholders");

  const session = await getSession(req);
  if (!session?.user) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const certificateId = params.id;
    console.log("Certificate ID:", certificateId);

    // Fetch placeholders from database
    const placeholders = await db
      .select()
      .from(placeholdersSchema)
      .where(eq(placeholdersSchema.certificate_id, certificateId));

    console.log("Placeholders fetched successfully");
    return NextResponse.json({ placeholders });
  } catch (error) {
    console.error("Error fetching placeholders:", error);
    return NextResponse.json({ message: "Failed to fetch placeholders" }, { status: 500 });
  }
}

// 📌 **POST Request - Update or Insert placeholders**
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  console.log("Received request for POST /api/certificates/[id]/placeholders");

  const session = await getSession(req);
  if (!session?.user) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { placeholders } = PayloadSchema.parse(body);
    const certificateId = params.id;
    console.log("Certificate ID:", certificateId);

    // Fetch existing placeholders for this certificate
    const existingPlaceholders = await db
      .select()
      .from(placeholdersSchema)
      .where(eq(placeholdersSchema.certificate_id, certificateId));

    // Convert existing placeholders to a Set for quick lookup
    const existingKeys = new Set(existingPlaceholders.map((p) => p.key));

    const placeholdersToInsert: Array<{
      id: string;
      certificate_id: string;
      key: string;
      value: string;
      discount: number;
      label: string;
      is_visible: boolean;
      font_size: number;
      color: string;
      x: number;
      y: number;
    }> = [];

    for (const p of placeholders) {
      if (existingKeys.has(p.key)) {
        // ✅ Update existing placeholders
        await db
          .update(placeholdersSchema)
          .set({
            value: p.value,
            discount: p.discount ?? 0,
            label: p.label,
            is_visible: p.is_visible ?? true,
            font_size: p.font_size ?? 14,
            color: p.color ?? "#000000",
            x: p.x ?? 0,
            y: p.y ?? 0,
          })
          .where(and(eq(placeholdersSchema.certificate_id, certificateId), eq(placeholdersSchema.key, p.key)));
      } else {
        // ✅ Insert new placeholders
        placeholdersToInsert.push({
          id: uuidv4(),
          certificate_id: certificateId,
          key: p.key,
          value: p.value,
          discount: p.discount ?? 0,
          label: p.label,
          is_visible: p.is_visible ?? true,
          font_size: p.font_size ?? 14,
          color: p.color ?? "#000000",
          x: p.x ?? 0,
          y: p.y ?? 0,
        });
      }
    }

    // ✅ Bulk insert only new placeholders
    if (placeholdersToInsert.length > 0) {
      await db.insert(placeholdersSchema).values(placeholdersToInsert);
    }

    // ✅ Fetch the latest updated placeholders after insert/update
    const updatedPlaceholders = await db
      .select()
      .from(placeholdersSchema)
      .where(eq(placeholdersSchema.certificate_id, certificateId));

    console.log("Placeholders updated successfully");
    return NextResponse.json({
      message: "Placeholders updated successfully",
      placeholders: updatedPlaceholders, // ✅ Return fully updated placeholders
    });

  } catch (error) {
    console.error("Error updating placeholders:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid payload", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update placeholders" }, { status: 500 });
  }
}
