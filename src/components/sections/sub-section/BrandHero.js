// import Image from "next/image";
// import React from "react";
// import brand1 from "@/assets/images/brand/brand_1.png";
// import brand2 from "@/assets/images/brand/brand_2.png";
// import brand3 from "@/assets/images/brand/brand_3.png";
// import brand4 from "@/assets/images/brand/brand_4.png";
// import brand5 from "@/assets/images/brand/brand_5.png";
// import brand6 from "@/assets/images/brand/brand_6.png";
// const BrandHero = () => {
//   return (
//     <div>
//       <div data-aos="fade-up">
//         <div className="container2-md flex flex-wrap items-center justify-center bg-white dark:bg-whiteColor-dark rounded-md mx-auto md:-translate-y-1/2 w-full shadow-brand">
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand1} alt="" />
//             </a>
//           </div>
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand2} alt="" />
//             </a>
//           </div>
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand3} alt="" />
//             </a>
//           </div>
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand4} alt="" />
//             </a>
//           </div>
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand5} alt="" />
//             </a>
//           </div>
//           <div className="basis-1/2 md:basis-1/4 lg:basis-1/5 flex justify-center py-4 lg:py-35px 2xl:py-45px">
//             <a href="#">
//               <Image src={brand6} alt="" />
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BrandHero;


import Image from "next/image";
import React from "react";
import brand1 from "@/assets/images/brand/brand_1.png";
import brand2 from "@/assets/images/brand/brand_2.png";
import brand3 from "@/assets/images/brand/brand_3.png";
import brand4 from "@/assets/images/brand/brand_4.png";
import brand5 from "@/assets/images/brand/brand_5.png";
import brand6 from "@/assets/images/brand/brand_6.png";

const BrandHero = () => {
  return (
    <div>
      <div data-aos="fade-up">
        <div className="container2-md flex flex-nowrap items-center justify-center bg-white dark:bg-whiteColor-dark rounded-md mx-auto md:-translate-y-1/2 w-full shadow-brand space-x-4">
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand1} alt="brand1" />
            </a>
          </div>
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand2} alt="brand2" />
            </a>
          </div>
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand3} alt="brand3" />
            </a>
          </div>
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand4} alt="brand4" />
            </a>
          </div>
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand5} alt="brand5" />
            </a>
          </div>
          <div className="flex justify-center py-5">
            <a href="#">
              <Image src={brand6} alt="brand6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandHero;