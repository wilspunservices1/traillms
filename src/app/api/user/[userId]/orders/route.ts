// src/app/api/orders/[userId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust the import according to your project setup
import { orders } from "@/db/schemas/orders"; // Adjust the import according to your project setup
import { eq } from "drizzle-orm";

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const body = await req.json();

    // Extract the fields from the request body
    const { status, totalAmount, paymentMethod, items } = body;

    // Validate fields
    if (!status || !totalAmount || !paymentMethod || !items) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Insert the new order into the database
    const newOrder = await db
      .insert(orders)
      .values({
        userId,
        status,
        totalAmount,
        paymentMethod,
        items,
      })
      .returning();

    return NextResponse.json({
      message: "Order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the order." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: { userId: string } }) {
    const { userId } = params;
  
    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }
  
    try {
      // Fetch all orders for the given userId
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId));
  
      if (userOrders.length === 0) {
        return NextResponse.json({ message: "No orders found for this user." }, { status: 404 });
      }
  
      return NextResponse.json({ orders: userOrders });
    } catch (error) {
      console.error("Error fetching orders:", error);
      return NextResponse.json(
        { error: "An error occurred while fetching orders." },
        { status: 500 }
      );
    }
  }