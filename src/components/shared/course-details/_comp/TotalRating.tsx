import React from "react";

const TotalRating = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-x-30px gap-y-5">
      <div className="lg:col-start-1 lg:col-span-4 px-10px py-30px bg-whiteColor dark:bg-whiteColor-dark shadow-review text-center">
        <p className="text-7xl font-extrabold text-blackColor dark:text-blackColor-dark leading-90px">
          5.0
        </p>
        <div className="text-secondaryColor">
          {" "}
          <i className="icofont-star"></i> <i className="icofont-star"></i>{" "}
          <i className="icofont-star"></i> <i className="icofont-star"></i>{" "}
          <i className="icofont-star"></i>
        </div>
        <p className="text-blackColor dark:text-blackColor-dark leading-26px font-medium">
          (17 Reviews)
        </p>
      </div>
      {/* progress bar  */}
      <div className="lg:col-start-5 lg:col-span-8 px-15px">
        <ul className="flex flex-col gap-y-3">
          <li className="flex items-center text-blackColor dark:text-blackColor-dark">
            <div>
              <span>5</span>{" "}
              <span>
                <i className="icofont-star text-secondaryColor"></i>
              </span>
            </div>
            <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
              <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
              <span className="absolute left-0 top-0 h-10px w-full bg-secondaryColor rounded-full"></span>
            </div>
            <div>
              <span>10</span>
            </div>
          </li>
          <li className="flex items-center text-blackColor dark:text-blackColor-dark">
            <div>
              <span>4</span>{" "}
              <span>
                <i className="icofont-star text-secondaryColor"></i>
              </span>
            </div>
            <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
              <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
              <span className="absolute left-0 top-0 h-10px w-4/5 bg-secondaryColor rounded-full"></span>
            </div>
            <div>
              <span>5</span>
            </div>
          </li>
          <li className="flex items-center text-blackColor dark:text-blackColor-dark">
            <div>
              <span>3</span>{" "}
              <span>
                <i className="icofont-star text-secondaryColor"></i>
              </span>
            </div>
            <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
              <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
              <span className="absolute left-0 top-0 h-10px w-60% bg-secondaryColor rounded-full"></span>
            </div>
            <div>
              <span>3</span>
            </div>
          </li>
          <li className="flex items-center text-blackColor dark:text-blackColor-dark">
            <div>
              <span>2</span>{" "}
              <span>
                <i className="icofont-star text-secondaryColor"></i>
              </span>
            </div>
            <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
              <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
              <span className="absolute left-0 top-0 h-10px w-30% bg-secondaryColor rounded-full"></span>
            </div>
            <div>
              <span>2</span>
            </div>
          </li>
          <li className="flex items-center text-blackColor dark:text-blackColor-dark">
            <div>
              <span>1</span>{" "}
              <span>
                <i className="icofont-star text-secondaryColor"></i>
              </span>
            </div>
            <div className="flex-grow relative mx-10px md:mr-10 lg:mr-10px">
              <span className="h-10px w-full bg-borderColor dark:bg-borderColor-dark rounded-full block"></span>
              <span className="absolute left-0 top-0 h-10px w-10% bg-secondaryColor rounded-full"></span>
            </div>
            <div>
              <span>1</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TotalRating;
