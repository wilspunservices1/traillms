import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { items, userId } = await req.json(); // Assuming items and userId are passed in the body

    // Ensure price is passed as integer in cents and courseId is included
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd', // Currency
        product_data: {
          name: item.name, // Name of the product
          images: [item.image], // Image URL
        },
        unit_amount: Math.round(parseFloat(item.price) * 100), // Convert price to cents (integer)
      },
      quantity: item.quantity || 1, // Default to 1 if no quantity is provided
    }));

    // Extract courseIds and add them to the metadata as a comma-separated string
    const courseIds = items.map((item: any) => item.courseId);

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/payProgress/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payProgress/cancel`,
      metadata: {
        userId, // Pass userId for order processing
        courseIds: courseIds.join(','), // Join courseIds into a comma-separated string
      },
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}


// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
//   apiVersion: '2024-06-20',
// });

// export async function POST(req: Request) {
//   try {
//     const { items, userId } = await req.json(); // Assuming items and userId are passed in the body

//     // Ensure price is passed as integer in cents and courseId is included
//     const lineItems = items.map((item: any) => ({
//       price_data: {
//         currency: 'usd', // Currency
//         product_data: {
//           name: item.name, // Name of the product
//           images: [item.image], // Image URL
//         },
//         unit_amount: Math.round(parseFloat(item.price) * 100), // Convert price to cents (integer)
//       },
//       quantity: item.quantity || 1, // Default to 1 if no quantity is provided
//     }));

//     // Extract courseIds and add them to the top-level metadata
//     const courseIds = items.map((item: any) => item.courseId);

//     // Create the checkout session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: lineItems,
//       mode: 'payment',
//       success_url: `${process.env.NEXT_PUBLIC_URL}/payProgress/success`,
//       cancel_url: `${process.env.NEXT_PUBLIC_URL}/payProgress/cancel`,
      // metadata: {
      //   userId,  // Pass userId for order processing
      //   items: JSON.stringify(items), // Pass items as a stringified JSON for webhook
      //   courseIds: JSON.stringify(courseIds), // Pass courseIds as a stringified array for webhook
//     return NextResponse.json(
//       { error: 'Failed to create checkout session.' },
//       { status: 500 }
//     );
//   }
// }

