const countTotalPrice = (items) => {
  // Initialize total price
  let totalPrice = 0;

  // Ensure items exist and calculate the total price
  if (items?.length) {
    totalPrice = items.reduce((ac, { price }) => {
      const numericPrice = parseFloat(price); // Ensure price is converted to a number
      return ac + (isNaN(numericPrice) ? 0 : numericPrice); // Add the price to the total
    }, 0);
  }

  return totalPrice.toFixed(2); // Return total price formatted to 2 decimal places
};

export default countTotalPrice;




// const countTotalPrice = (items) => {
//   // calculate total price
//   let totalPrice;
//   if (items?.length) {
//     totalPrice = parseFloat(
//       items?.reduce((ac, { price, quantity }) => ac + quantity * price, 0)
//     );
//   } else {
//     totalPrice = 0;
//   }

//   return totalPrice;
// };
// export default countTotalPrice;
