"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const ItemDashboard = ({ item }) => {
  const currentPath = usePathname();
  const { name, path, icon, tag, subItems } = item;
  const isActive = currentPath === path;

  const hasSubItems = subItems && subItems.length > 0;
  const [isOpen, setIsOpen] = useState(isActive);

  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <li
        className={`py-2.5 border-b border-borderColor dark:border-borderColor-dark ${
          hasSubItems || tag ? "flex justify-between items-center" : ""
        }`}
      >
        <div className="flex items-center w-full">
          <Link
            href={path || "#"}
            className={`flex gap-3 leading-1.8 text-nowrap ${
              isActive
                ? "text-primaryColor"
                : "text-contentColor dark:text-contentColor-dark"
            } hover:text-primaryColor dark:hover:text-primaryColor`}
          >
            {icon} {name}
          </Link>

          {tag && (
            <span className="text-xs font-medium text-whiteColor px-2.5 bg-primaryColor rounded-2xl leading-3.5">
              {tag}
            </span>
          )}

          {hasSubItems && (
            <button
              onClick={toggleSubMenu}
              className="ml-auto focus:outline-none text-contentColor dark:text-contentColor-dark"
              aria-expanded={isOpen}
              aria-controls={`submenu-${name}`}
            >
              {isOpen ? "▲" : "▼"}
            </button>
          )}
        </div>
      </li>

      {hasSubItems && isOpen && (
        <ul id={`submenu-${name}`} className="pl-4">
          {subItems.map((subItem, idx) => (
            <ItemDashboard key={idx} item={subItem} />
          ))}
        </ul>
      )}
    </>
  );
};

export default ItemDashboard;
