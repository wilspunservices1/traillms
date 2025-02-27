// src/app/api/stripe/webhook.ts

import { NextRequest } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { db } from "@/db";
import { orders } from "@/db/schemas/orders";
import { user } from "@/db/schemas/user";
import { cart } from "@/db/schemas/cart"; // Import the cart schema
import { chapters } from "@/db/schemas/courseChapters";
import { lectures } from "@/db/schemas/lectures";
import { sendEmail } from "@/libs/emial/emailService"; // Corrected import path
import { eq, inArray } from "drizzle-orm";
import { courses } from "@/db/schemas/courses";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  const body = await req.text(); // Parse raw body as text for signature verification
  const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
  const headersList = await headers();
  const sig = headersList.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    // Verify the event by checking the signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle specific events only
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId ?? "";
    const courseIdsString = session.metadata?.courseIds ?? "";

    if (!userId) {
      console.error("Missing userId in session metadata");
      return new Response("Missing userId in session metadata", {
        status: 400,
      });
    }

    if (!courseIdsString) {
      console.error("No course IDs found in metadata");
      return new Response("No course IDs found in metadata", { status: 400 });
    }

    // Convert the comma-separated string back into an array
    const purchasedCourseIds = courseIdsString.split(",").filter(Boolean);

    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
    const paymentMethod = session.payment_method_types[0] ?? "unknown";

    try {
      // **Fetch Detailed Course Information**
      const courseDetails = await db
        .select({
          courseId: courses.id,
          name: courses.title,
          price: courses.price,
        })
        .from(courses)
        .where(inArray(courses.id, purchasedCourseIds));

      console.log("✔️✔️ courses details for enroll", courseDetails);

      if (courseDetails.length === 0) {
        console.error(
          "No course details found for purchasedCourseIds:",
          purchasedCourseIds
        );
        return new Response("No course details found", { status: 400 });
      }

      // **Construct the items JSON Object**
      const items = courseDetails.map((course) => ({
        courseId: course.courseId,
        name: course.name,
        price: course.price,
        // Add other relevant fields as needed
      }));

      // **Insert the Order into the Database**
      await db.insert(orders).values({
        userId,
        status: "completed",
        totalAmount,
        paymentMethod,
        items, // Insert the constructed JSON object
      });

      // **Prepare the Courses to be Added to EnrolledCourses**
      const newCourses = purchasedCourseIds.map((courseId: string) => ({
        courseId,
        progress: 0, // Initially set the progress to 0
        completedLectures: [], // Initialize completedLectures as an empty array
      }));

      // **Fetch the User's Current EnrolledCourses**
      const existingUser = await db
        .select({
          enrolledCourses: user.enrolledCourses,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!existingUser.length) {
        console.error("User not found:", userId);
        return new Response(`User with ID ${userId} not found`, {
          status: 404,
        });
      }

      const existingCourses = existingUser[0].enrolledCourses || [];

      // **Update EnrolledCourses, Only Adding New Courses**
      const updatedEnrolledCourses = [
        ...existingCourses,
        ...newCourses.filter(
          (newCourse) =>
            !existingCourses.some(
              (existingCourse: any) =>
                existingCourse.courseId === newCourse.courseId
            )
        ),
      ];

      await db
        .update(user)
        .set({
          enrolledCourses: updatedEnrolledCourses,
        })
        .where(eq(user.id, userId));

      // **Unlock Lectures for Purchased Courses**

      // Fetch all chapters associated with the purchased courses
      const chaptersList = await db
        .select({
          id: chapters.id,
        })
        .from(chapters)
        .where(inArray(chapters.courseId, purchasedCourseIds));

      // Extract the chapter IDs
      const chapterIds = chaptersList.map((chapter) => chapter.id);

      // Update lectures to set isLocked to false where chapterId is in chapterIds
      await db
        .update(lectures)
        .set({ isLocked: false })
        .where(inArray(lectures.chapterId, chapterIds));

      console.log(
        `Lectures unlocked for user ${userId} and courses ${purchasedCourseIds}`
      );

      // **Remove Purchased Courses from Cart**

      // Fetch cart items for the user
      const cartItems = await db
        .select({
          id: cart.id,
          courseId: cart.courseId,
        })
        .from(cart)
        .where(eq(cart.userId, userId));

      // Identify cart items that match purchased courses
      const cartItemsToRemove = cartItems.filter((cartItem) =>
        purchasedCourseIds.includes(cartItem.courseId)
      );

      // Extract cart item IDs to remove
      const cartItemIdsToRemove = cartItemsToRemove.map((item) => item.id);

      // Delete the purchased courses from the cart
      if (cartItemIdsToRemove.length > 0) {
        await db.delete(cart).where(inArray(cart.id, cartItemIdsToRemove));
      }

      console.log(`Removed purchased courses from cart for user ${userId}`);

      // **Prepare Email Template Data**

      const courseNames = courseDetails.map((course) => course.name).join(", ");

      const emailTemplateData = {
        userName: session.customer_details?.name || "Customer",
        totalAmount: totalAmount.toFixed(2),
        orderDate: new Date().toLocaleDateString(),
        courseName: courseNames || "Your Courses", // Use course names instead of IDs
        instructorName: "Instructor Name", // Adjust as needed or fetch dynamically
        coursePrice: totalAmount.toFixed(2),
        discountAmount: "0.00",
        amountPaid: totalAmount.toFixed(2),
      };

      // **Send Order Confirmation Email**
      await sendEmail({
        to: session.customer_details?.email ?? "user@example.com",
        subject: "Your Order Confirmation",
        text: "Thank you for your order!",
        templateName: "orderConfirmation",
        templateData: emailTemplateData,
      });

      return new Response(
        "Order saved, lectures unlocked, cart updated, and email sent",
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error("Error processing order or email:", error);
      return new Response("Error processing order", { status: 500 });
    }
  } else {
    // Handle other event types safely
    console.log("Unhandled event type:", event.type);
    return new Response("Event ignored", { status: 200 });
  }
}
// // src/app/api/stripe/webhook.ts

// import { NextRequest } from 'next/server';
// import Stripe from 'stripe';
// import { headers } from 'next/headers';
// import { db } from '@/db';
// import { orders } from '@/db/schemas/orders';
// import { user } from '@/db/schemas/user';
// import { cart } from '@/db/schemas/cart'; // Import the cart schema
// import { chapters } from '@/db/schemas/courseChapters';
// import { lectures } from '@/db/schemas/lectures';
// import { sendEmail } from '@/libs/emial/emailService';
// import { eq, inArray } from 'drizzle-orm';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });

// export async function POST(req: NextRequest) {
//   const body = await req.text(); // Parse raw body as text for signature verification
//   const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
//   const sig = headers().get('stripe-signature') as string;

//   let event: Stripe.Event;

//   try {
//     // Verify the event by checking the signature
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err: any) {
//     console.error('⚠️ Webhook signature verification failed:', err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Handle specific events only
//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object as Stripe.Checkout.Session;

//     const userId = session.metadata?.userId ?? '';
//     const courseIdsString = session.metadata?.courseIds ?? '';

//     if (!userId) {
//       console.error('Missing userId in session metadata');
//       return new Response('Missing userId in session metadata', { status: 400 });
//     }

//     if (!courseIdsString) {
//       console.error('No course IDs found in metadata');
//       return new Response('No course IDs found in metadata', { status: 400 });
//     }

//     // Convert the comma-separated string back into an array
//     const purchasedCourseIds = courseIdsString.split(',').filter(Boolean);

//     const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
//     const paymentMethod = session.payment_method_types[0] ?? 'unknown';

//     try {
//       // Insert the order into the database
//       await db.insert(orders).values({
//         userId,
//         status: 'completed',
//         totalAmount,
//         paymentMethod,
//         items: purchasedCourseIds, // Store course IDs
//       });

//       // Prepare the courses to be added to enrolledCourses
//       const newCourses = purchasedCourseIds.map((courseId: string) => ({
//         courseId,
//         progress: 0, // Initially set the progress to 0
//       }));

//       // Fetch the user's current enrolledCourses
//       const existingUser = await db
//         .select({
//           enrolledCourses: user.enrolledCourses,
//         })
//         .from(user)
//         .where(eq(user.id, userId))
//         .limit(1);

//       if (!existingUser.length) {
//         console.error('User not found:', userId);
//         return new Response(`User with ID ${userId} not found`, { status: 404 });
//       }

//       const existingCourses = existingUser[0].enrolledCourses || [];

//       // Update enrolledCourses, only adding new courses that aren't already present
//       const updatedEnrolledCourses = [
//         ...existingCourses,
//         ...newCourses.filter(
//           (newCourse) =>
//             !existingCourses.some(
//               (existingCourse: any) => existingCourse.courseId === newCourse.courseId
//             )
//         ),
//       ];

//       await db
//         .update(user)
//         .set({
//           enrolledCourses: updatedEnrolledCourses,
//         })
//         .where(eq(user.id, userId));

//       // **Unlock Lectures for Purchased Courses**

//       // Fetch all chapters associated with the purchased courses
//       const chaptersList = await db
//         .select({
//           id: chapters.id,
//         })
//         .from(chapters)
//         .where(inArray(chapters.courseId, purchasedCourseIds));

//       // Extract the chapter IDs
//       const chapterIds = chaptersList.map((chapter) => chapter.id);

//       // Update lectures to set isLocked to false where chapterId is in chapterIds
//       await db
//         .update(lectures)
//         .set({ isLocked: false })
//         .where(inArray(lectures.chapterId, chapterIds));

//       console.log(`Lectures unlocked for user ${userId} and courses ${purchasedCourseIds}`);

//       // **Remove Purchased Courses from Cart**

//       // Fetch cart items for the user
//       const cartItems = await db
//         .select({
//           id: cart.id,
//           courseId: cart.courseId,
//         })
//         .from(cart)
//         .where(eq(cart.userId, userId));

//       // Identify cart items that match purchased courses
//       const cartItemsToRemove = cartItems.filter((cartItem) =>
//         purchasedCourseIds.includes(cartItem.courseId)
//       );

//       // Extract cart item IDs to remove
//       const cartItemIdsToRemove = cartItemsToRemove.map((item) => item.id);

//       // Delete the purchased courses from the cart
//       if (cartItemIdsToRemove.length > 0) {
//         await db.delete(cart).where(inArray(cart.id, cartItemIdsToRemove));
//       }

//       console.log(`Removed purchased courses from cart for user ${userId}`);

//       // Send order confirmation email
//       const emailTemplateData = {
//         userName: session.customer_details?.name || 'Customer',
//         totalAmount: totalAmount.toFixed(2),
//         orderDate: new Date().toLocaleDateString(),
//         courseName: 'Your Courses', // Adjust as needed
//         instructorName: 'Instructor Name', // Adjust as needed
//         coursePrice: totalAmount.toFixed(2),
//         discountAmount: '0.00',
//         amountPaid: totalAmount.toFixed(2),
//       };

//       await sendEmail({
//         to: session.customer_details?.email ?? 'user@example.com',
//         subject: 'Your Order Confirmation',
//         text: 'Thank you for your order!',
//         templateName: 'orderConfirmation',
//         templateData: emailTemplateData,
//       });

//       return new Response('Order saved, lectures unlocked, cart updated, and email sent', {
//         status: 200,
//       });
//     } catch (error) {
//       console.error('Error processing order or email:', error);
//       return new Response('Error processing order', { status: 500 });
//     }
//   } else {
//     // Handle other event types safely
//     console.log('Unhandled event type:', event.type);
//     return new Response('Event ignored', { status: 200 });
//   }
// }

// // src/app/api/stripe/webhook.ts

// import { NextRequest } from "next/server";
// import Stripe from "stripe";
// import { headers } from "next/headers";
// import { db } from "@/db";
// import { orders } from "@/db/schemas/orders";
// import { user } from "@/db/schemas/user";
// import { cart } from "@/db/schemas/cart"; // Import the cart schema
// import { chapters } from "@/db/schemas/courseChapters";
// import { lectures } from "@/db/schemas/lectures";
// import { sendEmail } from "@/libs/emial/emailService";
// import { eq, inArray, and } from "drizzle-orm";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2024-06-20",
// });

// export async function POST(req: NextRequest) {
//   const body = await req.text(); // Parse raw body as text for signature verification
//   const endpointSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;
//   const sig = headers().get("stripe-signature") as string;

//   let event: Stripe.Event;

//   try {
//     console.log("Raw body:", body); // Log the raw body for debugging
//     console.log("Stripe signature:", sig); // Log the signature for debugging

//     // Verify the event by checking the signature
//     event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
//   } catch (err: any) {
//     console.error("⚠️ Webhook signature verification failed:", err.message);
//     return new Response(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   // Log the event type to track incoming events
//   console.log("Received event type:", event.type);

//   // Handle specific events only
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session;

//     const userId = session.metadata?.userId ?? "";
//     const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];

//     if (!userId) {
//       console.error("Missing userId in session metadata");
//       return new Response("Missing userId in session metadata", { status: 400 });
//     }

//     const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
//     const paymentMethod = session.payment_method_types[0] ?? "unknown";

//     try {
//       // Insert the order into the database
//       await db.insert(orders).values({
//         userId,
//         status: "completed",
//         totalAmount,
//         paymentMethod,
//         items,
//       });

//       // Prepare the courses to be added to enrolledCourses
//       const newCourses = items.map((item: any) => ({
//         courseId: item?.courseId || "", // Handle undefined or missing courseId
//         progress: 0, // Initially set the progress to 0
//       }));

//       // Fetch the user's current enrolledCourses
//       const existingUser = await db
//         .select({
//           enrolledCourses: user.enrolledCourses,
//         })
//         .from(user)
//         .where(eq(user.id, userId))
//         .limit(1);

//       if (!existingUser.length) {
//         console.error("User not found:", userId);
//         return new Response(`User with ID ${userId} not found`, { status: 404 });
//       }

//       const existingCourses = existingUser[0].enrolledCourses || [];

//       // Update enrolledCourses, only adding new courses that aren't already present
//       const updatedEnrolledCourses = [
//         ...existingCourses,
//         ...newCourses.filter(
//           (newCourse) =>
//             !existingCourses.some(
//               (existingCourse: any) => existingCourse.courseId === newCourse.courseId
//             )
//         ),
//       ];

//       await db
//         .update(user)
//         .set({
//           enrolledCourses: updatedEnrolledCourses,
//         })
//         .where(eq(user.id, userId));

//       // **Unlock Lectures for Purchased Courses**
//       // a. Get the list of purchased course IDs
//       const purchasedCourseIds = newCourses.map((course) => course.courseId);

//       // b. Fetch all chapters associated with the purchased courses
//       const chaptersList = await db
//         .select({
//           id: chapters.id,
//         })
//         .from(chapters)
//         .where(inArray(chapters.courseId, purchasedCourseIds));

//       // c. Extract the chapter IDs
//       const chapterIds = chaptersList.map((chapter) => chapter.id);

//       // d. Update lectures to set isLocked to false where chapterId is in chapterIds
//       await db
//         .update(lectures)
//         .set({ isLocked: false })
//         .where(inArray(lectures.chapterId, chapterIds));

//       console.log(`Lectures unlocked for user ${userId} and courses ${purchasedCourseIds}`);

//       // **Remove Purchased Courses from Cart**

//       // Fetch cart items for the user
//       const cartItems = await db
//         .select({
//           id: cart.id,
//           courseId: cart.courseId,
//         })
//         .from(cart)
//         .where(eq(cart.userId, userId));

//       // Identify cart items that match purchased courses
//       const cartItemsToRemove = cartItems.filter((cartItem) =>
//         purchasedCourseIds.includes(cartItem.courseId)
//       );

//       // Extract cart item IDs to remove
//       const cartItemIdsToRemove = cartItemsToRemove.map((item) => item.id);
//       // console.log("cartItemIdsToRemove",cartItemIdsToRemove)

//       // Delete the purchased courses from the cart
//       if (cartItemIdsToRemove.length > 0) {
//         await db.delete(cart).where(inArray(cart.id, cartItemIdsToRemove));
//       }

//       console.log(`Removed purchased courses from cart for user ${userId}`);

//       // Send order confirmation email
//       const emailTemplateData = {
//         userName: session.customer_details?.name || "Customer",
//         totalAmount: totalAmount.toFixed(2),
//         orderDate: new Date().toLocaleDateString(),
//         courseName: items.length > 0 ? items[0].name : "Course Name",
//         instructorName: "Instructor Name",
//         coursePrice: totalAmount.toFixed(2),
//         discountAmount: "0.00",
//         amountPaid: totalAmount.toFixed(2),
//       };

//       await sendEmail({
//         to: session.customer_details?.email ?? "user@example.com",
//         subject: "Your Order Confirmation",
//         text: "Thank you for your order!",
//         templateName: "orderConfirmation",
//         templateData: emailTemplateData,
//       });

//       return new Response("Order saved, lectures unlocked, cart updated, and email sent", {
//         status: 200,
//       });
//     } catch (error) {
//       console.error("Error processing order or email:", error);
//       return new Response("Error processing order", { status: 500 });
//     }
//   } else {
//     // Handle other event types safely
//     console.log("Unhandled event type:", event.type);
//     return new Response("Event ignored", { status: 200 });
//   }
// }

