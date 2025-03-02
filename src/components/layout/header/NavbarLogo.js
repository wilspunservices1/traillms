import Image from "next/image";
import React from "react";
import logo1 from "@/assets/images/logo/favicon.png";
import Link from "next/link";
const NavbarLogo = () => {
  return (
    <div className="lg:col-start-1 lg:col-span-2">
      <Link href="/" className="flex items-center justify-center w-full py-2">
        <Image
          priority="false"
          src={logo1}
          width={60}
          alt="MeridianLMS Logo"
          className="mr-2"
        />
        <div className="flex  items-start text-left">
          <span className="font-bold text-2xl text-[#FF4081]">Meridian</span>
          <span className="font-bold text-2xl pl-2 text-[#3D4AB1]">LMS</span>
        </div>
      </Link>
    </div>
  );
};

export default NavbarLogo;
