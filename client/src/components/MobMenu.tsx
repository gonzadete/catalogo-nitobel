import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

export default function MobMenu({ menu, onSelectOption }) {
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState(null);
  const MotionDiv = motion.div;
  const MotionList = motion.ul;
  const items = Array.isArray(menu) ? menu : [];

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setClicked(null);
  };

  const subMenuDrawer = {
    enter: {
      height: "auto",
      overflow: "hidden",
    },
    exit: {
      height: 0,
      overflow: "hidden",
    },
  };

  return (
    <div>
      <button className="lg:hidden z-999 relative" onClick={toggleDrawer}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <MotionDiv
        className="fixed left-0 right-0 top-16 overflow-y-auto h-full bg-[#18181A] backdrop-blur text-white p-6 pb-20"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
      >
        <ul>
          {items.map(({ descripcion, name, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = subMenu?.length;
            const label = descripcion ?? name;
            return (
              <li key={label} className="">
                <span
                  className="flex-center-between p-4 hover:bg-white/5 rounded-md cursor-pointer relative"
                  onClick={() => setClicked(isClicked ? null : i)}
                >
                  {label}
                  {hasSubMenu && (
                    <ChevronDown
                      className={`ml-auto ${isClicked && "rotate-180"} `}
                    />
                  )}
                </span>
                {hasSubMenu && (
                  <MotionList
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                    className="ml-5"
                  >
                    {subMenu.map((submenu) => {
                      const IconComponent = submenu.icon;

                      return (
                        <li
                          key={submenu.name}
                          className="p-2 flex-center hover:bg-white/5 rounded-md gap-x-2 cursor-pointer"
                          onClick={() => {
                            onSelectOption?.(submenu, { codigo: submenu.codMenu, descripcion: label });
                            setIsOpen(false);
                            setClicked(null);
                          }}
                        >
                          {IconComponent ? <IconComponent size={17} /> : null}
                          {submenu.name}
                        </li>
                      );
                    })}
                  </MotionList>
                )}
              </li>
            );
          })}
        </ul>
      </MotionDiv>
    </div>
  );
}