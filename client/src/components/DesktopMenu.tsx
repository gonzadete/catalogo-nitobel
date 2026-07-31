import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const MotionListItem = motion.li;
const MotionDiv = motion.div;

// Recibe 2 props: menu y onSelectOption. Renderiza un menú de escritorio y la función onSelectOption para capturar clics en opciones del menú.
export default function DesktopMenu({ menu, onSelectOption }) {
  // isHover se usa para saber si el submenú está abierto o cerrado.
  const [isHover, toggleHover] = useState(false);

  // Función para invertir el estado de isHover al hacer hover sobre el menú. Eso controla si el dropdown aparece o desaparece.
  const toggleHoverMenu = () => {
    toggleHover(!isHover);
  };

  // Variantes de animación para el submenú usando Framer Motion. Define cómo debe aparecer (enter) y desaparecer (exit) el submenú.
  const subMenuAnimate = {
    enter: {
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.5,
      },
      display: "block",
    },
    exit: {
      opacity: 0,
      rotateX: -15,
      transition: {
        duration: 0.5,
      },
      transitionEnd: {
        display: "none",
      },
    },
  };


  const hasSubMenu = menu?.subMenu?.length;
  const label = menu.descripcion ?? menu.name;

  return (
    <MotionListItem
      className="group/link"
      onHoverStart={() => {
        toggleHoverMenu();
      }}
      onHoverEnd={toggleHoverMenu}
      key={menu.descripcion}
    >
      <span className="flex-center gap-1 hover:bg-white/5 cursor-pointer px-3 py-1 rounded-xl">
        {label}
        {hasSubMenu && (
          <ChevronDown className="mt-[0.6px] group-hover/link:rotate-180 duration-200" />
        )}
      </span>
      {hasSubMenu && (
        <MotionDiv
          className="sub-menu"
          initial="exit"
          animate={isHover ? "enter" : "exit"}
          variants={subMenuAnimate}
        >
          <div
            className={`grid gap-7 bg-[#e3e3ee] ${
              menu.gridCols === 3
                ? "grid-cols-3"
                : menu.gridCols === 2
                ? "grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {hasSubMenu && 
              menu.subMenu.map((submenu, i) => (
                <div
                  className="relative cursor-pointer"
                  key={i}
                  onClick={() => onSelectOption?.(submenu, menu)}
                >
                  {menu.gridCols > 1 && menu?.subMenuHeading?.[i] && (
                    <p className="text-sm mb-4 text-gray-500">
                      {menu?.subMenuHeading?.[i]}
                    </p>
                  )}
                  <div className="flex-center gap-x-4 p-2 group/menubox">
                    <div className="bg-white/5 w-fit p-2 rounded-md group-hover/menubox:bg-white group-hover/menubox:text-gray-900 duration-300">
                      {submenu.icon && <submenu.icon />}
                    </div>
                    <div>
                      <h6 className="font-semibold">{submenu.name}</h6>
                      <p className="text-sm text-gray-400">{submenu.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </MotionDiv>
      )}
    </MotionListItem>
  );
}