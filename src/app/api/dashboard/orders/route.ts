import { NextResponse } from "next/server";
import { db } from "@/db"; // Adjust this import path to your project structure
import { orders } from "@/db/schemas/orders";
import { user } from "@/db/schemas/user";
import { sql, eq } from "drizzle-orm";

// Helper function to get chart data
async function getDashboardData() {
  try {
    // 1. Sales Distribution by Payment Method
    const paymentMethodData = await db
      .select({
        paymentMethod: orders.paymentMethod,
        totalSales: sql`SUM(${orders.totalAmount})`.as("totalSales"),
      })
      .from(orders)
      .groupBy(orders.paymentMethod);

    // 2. Orders Status Breakdown
    const orderStatusData = await db
      .select({
        status: orders.status,
        count: sql`COUNT(*)`.as("count"),
      })
      .from(orders)
      .groupBy(orders.status);

    // 3. Revenue by User Type
    const userRevenueData = await db
      .select({
        userId: user.id,
        name: user.name,
        totalRevenue: sql`SUM(${orders.totalAmount})`.as("totalRevenue"),
      })
      .from(orders)
      .leftJoin(user, eq(orders.userId, user.id))
      .groupBy(user.id)
      .orderBy(sql`SUM(${orders.totalAmount})`, "desc");

    // 4. Revenue Over Time (e.g., by month)
    const revenueOverTimeData = await db
      .select({
        month: sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`.as("month"), // Group by month-year
        totalRevenue: sql`SUM(${orders.totalAmount})`.as("totalRevenue"),
      })
      .from(orders)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`);

    // 5. Top Selling Courses (using course names)
    const topSellingCoursesData = await db
      .select({
        courseName: sql`jsonb_array_elements(${orders.items}::jsonb)->>'name'`.as("courseName"),
        totalEnrollments: sql`COUNT(*)`.as("totalEnrollments"), // Count enrollments per course
      })
      .from(orders)
      .groupBy(sql`jsonb_array_elements(${orders.items}::jsonb)->>'name'`)
      .orderBy(sql`COUNT(*)`, "desc")
      .limit(5);

    // 6. Order Volume Trend (by day)
    const orderVolumeTrendData = await db
      .select({
        date: sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`.as("date"),
        orderCount: sql`COUNT(*)`.as("orderCount"),
      })
      .from(orders)
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM-DD')`);

    return {
      paymentMethodData,
      orderStatusData,
      userRevenueData,
      revenueOverTimeData,
      topSellingCoursesData,
      orderVolumeTrendData,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw new Error("Error fetching dashboard data");
  }
}

// API Route to expose the dashboard data
export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
