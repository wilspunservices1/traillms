import { NextResponse } from "next/server";
import { db } from "@/db";
import { cart } from "@/db/schemas/cart";
import { courses } from "@/db/schemas/courses";
import { and, eq } from "drizzle-orm";

// POST /api/user/[userId]/cart
export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const { courseId } = await req.json();

  // Validate that both userId and courseId are provided
  if (!userId || !courseId) {
    return NextResponse.json(
      { error: "User ID and Course ID are required." },
      { status: 400 }
    );
  }

  try {
    // Check if the course exists in the database
    const courseExists = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (courseExists.length === 0) {
      return NextResponse.json(
        { error: `Course with ID '${courseId}' does not exist.` },
        { status: 404 }
      );
    }

    // Check if the course is already in the user's cart
    const existingCartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, userId), eq(cart.courseId, courseId))) // Correctly chain conditions
      .limit(1);

    if (existingCartItem.length > 0) {
      return NextResponse.json(
        { message: "Course already in cart." },
        { status: 409 }
      );
    }

    // Add the course to the user's cart
    await db.insert(cart).values({
      userId,
      courseId,
      createdAt: new Date(), // Add the createdAt timestamp
    });

    return NextResponse.json(
      { message: "Course added to cart." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding course to cart:", error);
    return NextResponse.json(
      { error: "An error occurred while adding the course to the cart." },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request, { params }: { params: { userId: string } }) {
//   const { userId } = params;

//   // Validate that userId is provided
//   if (!userId) {
//     return NextResponse.json(
//       { error: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Fetch all cart items for the user
//     const cartItems = await db
//       .select({
//         cartId: cart.id,
//         courseId: cart.courseId,
//         title: courses.title,
//         price: courses.price,
//         estimatedPrice: courses.estimatedPrice,
//         isFree: courses.isFree,
//         insName: courses.insName,
//         thumbnail: courses.thumbnail
//       })
//       .from(cart)
//       .leftJoin(courses, eq(cart.courseId, courses.id))
//       .where(eq(cart.userId, userId));

//     if (cartItems.length === 0) {
//       return NextResponse.json({ message: "No items in the cart." }, { status: 404 });
//     }

//     // Calculate discount and modify cartItems with discount information
//     const cartItemsWithDiscount = cartItems.map(item => {
//       const price = parseFloat(item.price);
//       const estimatedPrice = parseFloat(item.estimatedPrice);

//       // Calculate discount percentage if applicable
//       let discount = 0;
//       if (estimatedPrice > price) {
//         discount = ((estimatedPrice - price) / estimatedPrice) * 100;
//       }

//       return {
//         ...item,
//         discount: discount.toFixed(2), // Add discount field (rounded to 2 decimal places)
//       };
//     });

//     // Return the cart items with discount information
//     return NextResponse.json(cartItemsWithDiscount, { status: 200 });
    
//   } catch (error) {
//     console.error("Error fetching cart items:", error);
//     return NextResponse.json(
//       { error: "An error occurred while fetching cart items." },
//       { status: 500 }
//     );
//   }
// }


// PATCH /api/user/[userId]/cart
export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;
  const { addCourses, removeCourses } = await req.json();

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  // Add courses to the cart
  if (addCourses && Array.isArray(addCourses)) {
    for (const courseId of addCourses) {
      const courseExists = await db
        .select()
        .from(courses)
        .where({ id: courseId })
        .limit(1);
      if (courseExists.length > 0) {
        await db.insert(cart).values({ userId, courseId });
      }
    }
  }

  // Remove courses from the cart
  if (removeCourses && Array.isArray(removeCourses)) {
    await db.delete(cart).where({
      userId,
      courseId: { in: removeCourses },
    });
  }

  return NextResponse.json({ message: "Cart updated successfully." });
}

// DELETE /api/user/[userId]/cart?courseId=COURSE_ID


export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  // Validate that userId is provided
  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    // Fetch all cart items for the user
    const cartItems = await db
      .select({
        cartId: cart.id,
        courseId: cart.courseId,
        title: courses.title,
        price: courses.price,
        estimatedPrice: courses.estimatedPrice,
        isFree: courses.isFree,
        insName: courses.insName,
        thumbnail: courses.thumbnail,
      })
      .from(cart)
      .leftJoin(courses, eq(cart.courseId, courses.id))
      .where(eq(cart.userId, userId));

    if (cartItems.length === 0) {
      return NextResponse.json([], { status: 200 }); // Return empty array if no items are in the cart
    }

    // Calculate discount and modify cartItems with discount information
    const cartItemsWithDiscount = cartItems.map((item) => {
      const price = parseFloat(item.price) || 0; // Ensure price is a valid number
      const estimatedPrice = parseFloat(item.estimatedPrice) || 0; // Ensure estimatedPrice is a valid number

      // Calculate discount percentage if applicable
      let discount = 0;
      if (estimatedPrice > price) {
        discount = ((estimatedPrice - price) / estimatedPrice) * 100;
      }

      return {
        ...item,
        discount: discount.toFixed(2), // Add discount field (rounded to 2 decimal places)
      };
    });

    // Return the cart items with discount information
    return NextResponse.json(cartItemsWithDiscount, { status: 200 });

  } catch (error) {
    console.error("Error fetching cart items:", error.message || error);
    return NextResponse.json(
      { error: "An error occurred while fetching cart items." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { searchParams } = new URL(req.url);
  const cartId = searchParams.get('cartId');
  const userId = params.userId;

  try {
    if (cartId) {
      // Delete the cart item based on cartId
      const deleteResult = await db.delete(cart).where(eq(cart.id, cartId));

      // Check if any rows were affected (i.e., cart item removed)
      if (deleteResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Cart item not found.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Cart item removed successfully.' },
        { status: 200 }
      );
    } else {
      // No cartId provided, delete all cart items for the user
      const deleteResult = await db
        .delete(cart)
        .where(eq(cart.userId, userId));

      // Check if any rows were affected
      if (deleteResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'No cart items found for this user.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'All cart items removed successfully.' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error removing cart item(s):', error);
    return NextResponse.json(
      { error: 'An error occurred while removing the cart item(s).' },
      { status: 500 }
    );
  }
}


// export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
//   const { searchParams } = new URL(req.url);
//   const cartId = searchParams.get("cartId");

//   // Validate that cartId is provided
//   if (!cartId) {
//     return NextResponse.json(
//       { error: "Cart ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     // Delete the cart item based on cartId
//     const deleteResult = await db
//       .delete(cart)
//       .where(eq(cart.id, cartId));

//     // Check if any rows were affected (i.e., cart item removed)
//     if (deleteResult.rowCount === 0) {
//       return NextResponse.json(
//         { error: "Cart item not found." },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       { message: "Cart item removed successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error removing cart item:", error);
//     return NextResponse.json(
//       { error: "An error occurred while removing the cart item." },
//       { status: 500 }
//     );
//   }
// }
