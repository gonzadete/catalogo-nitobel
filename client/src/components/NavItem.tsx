import React from "react";
import { NavLink } from "react-router-dom";

const NavItem = ({ icon, text, isOpen, to }) => {
  const itemContent = (
    <>
      <span
        data-tooltip-id={!isOpen ? "sidebar-tooltip" : undefined}
        data-tooltip-content={!isOpen ? text : undefined}
        className="text-xl"
      >
        {icon}
      </span>
      {isOpen && <div>{text}</div>}
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-4 cursor-pointer w-full transition-colors ${
            isActive ? "text-blue-400" : "text-white hover:text-blue-400"
          }`
        }
      >
        {itemContent}
      </NavLink>
    );
  }

  return (
    <div className="flex items-center gap-4 cursor-pointer w-full hover:text-blue-400">
      {itemContent}
    </div>
  );
};

export default NavItem;
