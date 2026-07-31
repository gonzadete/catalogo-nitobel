import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import { motion } from "framer-motion";
import { menuItems } from "./data";
import NavItem from "./NavItem";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <motion.div
        initial={{ width: 80 }}
        animate={{ width: isOpen ? 240 : 80 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900 h-screen text-white p-4 flex flex-col gap-6"
      >
        <button
          className="text-xl mb-4"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <FaBars />
        </button>
        <nav
          className={`flex flex-col gap-11 h-full overflow-y-auto ${
            !isOpen && "no-scrollbar"
          }`}
        >
          {menuItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              text={item.text}
              isOpen={isOpen}
              to={item.to}
            />
          ))}
        </nav>
      </motion.div>
      {!isOpen && <Tooltip id="sidebar-tooltip" offset={40} />}
    </div>
  );
};

export default Sidebar;
