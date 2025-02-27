import { NextResponse } from "next/server";
import { db } from "@/db"; // Assuming you have a db file for your Drizzle ORM connection
import { orders } from "@/db/schemas/orders";
import { sendEmail } from "@/libs/emial/emailService"; // Assuming your email service is in services folder
import { eq, sql } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";
import {user} from "@/db/schemas/user";

export const dynamic = "force-dynamic";

// POST handler to complete an order
export async function POST(req: Request) {
  try {
    const { userId, items, totalAmount, paymentMethod } = await req.json();

    // Validate the required data
    if (!userId || !items || !totalAmount || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid order data." },
        { status: 400 }
      );
    }

    // Insert the order into the database
    const [newOrder] = await db
      .insert(orders)
      .values({
        userId,
        status: "completed", // Set the status as completed
        totalAmount,
        paymentMethod,
        items,
      })
      .returning("*");

    // If order insertion fails
    if (!newOrder) {
      return NextResponse.json(
        { error: "Failed to save the order." },
        { status: 500 }
      );
    }

    // Send email confirmation
    const emailTemplateData = {
      userName: "Customer Name", // Replace with actual user data if available
      totalAmount: totalAmount.toString(),
      orderDate: new Date().toLocaleDateString(),
      orderItems: items
        .map((item) => `${item.name} - $${item.price}`)
        .join(", "),
    };

    await sendEmail({
      to: "user@example.com", // Replace with actual user email
      subject: "Your Order Confirmation",
      text: "Thank you for your order!",
      templateName: "orderConfirmation",
      templateData: emailTemplateData,
    });

    return NextResponse.json(
      { message: "Order completed and email sent.", orderId: newOrder.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete the order." },
      { status: 500 }
    );
  }
}


// Define a type for the count result
type CountResult = { count: string };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1", 10); // Default to page 1 if not provided
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 items per page
    const offset = (page - 1) * limit;

    // **Step 1: Validate `userId`**
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId in query parameters." },
        { status: 400 }
      );
    }

    // **Step 2: Fetch the Courses Owned by the Instructor**
    const instructorCourses = await db
      .select({
        courseId: courses.id,
        title: courses.title,
      })
      .from(courses)
      .where(sql`${courses.userId} = ${userId}`);

    if (instructorCourses.length === 0) {
      return NextResponse.json(
        { message: "No courses found for this instructor." },
        { status: 404 }
      );
    }

    // **Step 3: Extract `courseIds`**
    const courseIds = instructorCourses.map((course) => course.courseId);
    console.log("Course IDs:", courseIds); // For debugging purposes

    // **Step 4: Count Total Matching Orders**
    const totalOrdersResult = await db
      .select({
        count: sql`COUNT(*)`.as("count"),
      })
      .from(orders)
      .where(
        sql`EXISTS (
          SELECT 1 FROM json_array_elements(${orders.items}) AS elem
          WHERE elem->>'courseId' IN (${sql.join(
            courseIds.map((id) => sql`${id}`),
            sql`, `
          )})
        )`
      );

    // **Step 5: Extract and Parse the Count**
    const countResult = totalOrdersResult[0] as CountResult;
    const totalRecords = parseInt(countResult?.count || '0', 10);
    console.log("Total Orders Count:", totalRecords); // For debugging purposes

    // **Step 6: Handle No Matching Orders**
    if (totalRecords === 0) {
      return NextResponse.json(
        { message: "No orders found for the instructor's courses." },
        { status: 404 }
      );
    }

    // **Step 7: Fetch Paginated Orders**
    const paginatedOrders = await db
      .select({
        orderId: orders.id,
        userId: orders.userId,
        uniqueIdentifier: user.uniqueIdentifier, // Include uniqueIdentifier
        items: orders.items,
        totalAmount: orders.totalAmount,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
        status: orders.status,
      })
      .from(orders)
      .innerJoin(user, eq(orders.userId, user.id))
      .where(
        sql`EXISTS (
          SELECT 1 FROM json_array_elements(${orders.items}) AS elem
          WHERE elem->>'courseId' IN (${sql.join(
            courseIds.map((id) => sql`${id}`),
            sql`, `
          )})
        )`
      )
      .limit(limit)
      .offset(offset)
      .orderBy(orders.createdAt, "desc");

    // console.log("Paginated Orders:", paginatedOrders); // For debugging purposes

    // **Step 8: Calculate Pagination Metadata**
    const totalPages = Math.ceil(totalRecords / limit);
    const hasNext = offset + limit < totalRecords;
    const hasPrevious = page > 1;

    // **Step 9: Return the Response**
    return NextResponse.json({
      message: "Orders fetched successfully",
      length: paginatedOrders.length,
      total: totalRecords,
      page,
      perPage: limit,
      hasNext,
      hasPrevious,
      data: paginatedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders for instructor:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch orders.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
