import Image from "next/image";
import React from "react";
import logoImage from "@/assets/images/logo/favicon.png";
import useIsSecondary from "@/hooks/useIsSecondary";
import Link from "next/link";
const CopyRight = () => {
  const { isSecondary } = useIsSecondary();
  return (
    <div>
      {isSecondary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-10 lg:mt-4 items-center border-t border-darkcolor">
          <div>
            <p className="text-base text-center sm:text-start text-darkgray">
              © 2024 Powered by{" "}
              <a href="#" className="hover:text-primaryColor">
                MeridianLMS
              </a>{" "}
              . All Rights Reserved.
            </p>
          </div>

          <div>
            <ul className="flex items-center justify-center sm:justify-end">
              <li>
                <a
                  href="#"
                  className="text-base text-darkgray hover:text-primaryColor pr-4 border-r border-darkgray leading-1"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-base text-darkgray hover:text-primaryColor pl-4"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-30px pt-10 items-center">
         
          <div className="lg:col-start-1 lg:col-span-3">
            <Link
              href="/"
              className="flex items-center justify-center w-full py-2"
            >
              <Image src={logoImage} alt="" placeholder="blur" />
              <div className="flex  items-start text-left">
                <span className="font-bold text-xl text-white pl-0">
                  Meridian
                </span>
                <span className="font-bold text-xl pl-2 text-yellow">
                  LMS
                </span>
              </div>
            </Link>
          </div>

          <div className="lg:col-start-4 lg:col-span-6 pl-10">
            <p className="text-whiteColor">
              Copyright © 2024  by
              MeridianLMS. All Rights Reserved.
            </p>
          </div>

          <div className="lg:col-start-10 lg:col-span-3">
            <ul className="flex gap-3 lg:gap-2 2xl:gap-3 lg:justify-end">
              <li>
                <a
                  href="https://www.facebook.com"
                  className="w-40.19px lg:w-35px 2xl:w-40.19px h-37px lg:h-35px 2xl:h-37px leading-37px lg:leading-35px 2xl:leading-37px text-whiteColor bg-whiteColor bg-opacity-10 hover:bg-primaryColor text-center"
                >
                  <i className="icofont-facebook"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.twitter.com"
                  className="w-40.19px lg:w-35px 2xl:w-40.19px h-37px lg:h-35px 2xl:h-37px leading-37px lg:leading-35px 2xl:leading-37px text-whiteColor bg-whiteColor bg-opacity-10 hover:bg-primaryColor text-center"
                >
                  <i className="icofont-twitter"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.vimeo.com"
                  className="w-40.19px lg:w-35px 2xl:w-40.19px h-37px lg:h-35px 2xl:h-37px leading-37px lg:leading-35px 2xl:leading-37px text-whiteColor bg-whiteColor bg-opacity-10 hover:bg-primaryColor text-center"
                >
                  <i className="icofont-vimeo"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com"
                  className="w-40.19px lg:w-35px 2xl:w-40.19px h-37px lg:h-35px 2xl:h-37px leading-37px lg:leading-35px 2xl:leading-37px text-whiteColor bg-whiteColor bg-opacity-10 hover:bg-primaryColor text-center"
                >
                  <i className="icofont-linkedin"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.skype.com"
                  className="w-40.19px lg:w-35px 2xl:w-40.19px h-37px lg:h-35px 2xl:h-37px leading-37px lg:leading-35px 2xl:leading-37px text-whiteColor bg-whiteColor bg-opacity-10 hover:bg-primaryColor text-center"
                >
                  <i className="icofont-skype"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyRight;
