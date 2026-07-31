import { useEffect, useState } from "react";
import Logo from "./assets/Logo.png";
import BannerAccesorios from "./assets/banner/BannerAccesorios.jpg";
import BannerConexiones from "./assets/banner/BannerConexiones.jpg";
import BannerFocos from "./assets/banner/BannerFocos.jpg";
import DesktopMenu from "./components/DesktopMenu";
import MobMenu from "./components/MobMenu";
import Cards from "./components/Cards";
import "./App.css";
import { fetchMenusWithOpciones, fetchProductos } from "./api";

const LogoWSP = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="WhatsApp">
    <circle cx="32" cy="32" r="30" fill="#25D366"/>
    <path fill="#fff" d="M46.7 17.3A20.4 20.4 0 0 0 32 11.2C20.7 11.2 11.5 20.3 11.5 31.6c0 3.6 1 7.1 2.8 10.1L11.1 53l11.6-3c2.8 1.5 6 2.3 9.2 2.3h.1c11.3 0 20.5-9.1 20.5-20.4 0-5.5-2.1-10.6-5.8-14.6Zm-14.8 31c-3 0-5.9-.8-8.4-2.3l-.6-.3-6.9 1.8 1.8-6.7-.4-.7a17 17 0 0 1-2.6-9c0-9.4 7.7-17 17.1-17 4.5 0 8.7 1.7 11.9 4.9a16.8 16.8 0 0 1 4.9 11.9c0 9.4-7.7 17-17 17Zm9.4-12.8c-.5-.2-2.8-1.4-3.2-1.5-.4-.1-.7-.2-1 .2-.3.5-1.1 1.5-1.4 1.8-.3.3-.5.4-1 .2-.5-.2-2-0.7-3.8-2.2-1.4-1.2-2.4-2.7-2.7-3.2-.3-.5 0-.8.2-1 .2-.2.5-.5.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1-2.5-1.4-3.4-.4-.9-.8-.8-1-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 4s1.7 4.7 1.9 5c.2.3 3.3 5 8 7 1.1.5 2 .8 2.7 1 .8.2 1.6.2 2.2.1.7-.1 2.8-1.1 3.2-2.2.4-1 .4-1.8.3-2-.1-.2-.4-.3-.9-.5Z"/>
  </svg>`,
)};`;

export default function App() {
  // Estado para controlar la visibilidad del banner promocional
  const [showBanner, setShowBanner] = useState(true);
  //
  const [currentSlide, setCurrentSlide] = useState(0);
  //
  const bannerImages = [BannerAccesorios, BannerConexiones, BannerFocos];
  // Funciones para navegar entre las imágenes del banner
  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };
  // Función para ir a la imagen anterior, con lógica para volver al último slide si se está en el primero
  const goToPrevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length,
    );
  };

  // pide al backend menus con sus opciones y productos
  const [data, setData] = useState([]);

  // Productos a mostrar en pantalla según opción seleccionada
  const [productos, setProductos] = useState([]);

  // Label que muestra la opción seleccionada (Ej.: “Luces Led / Delanteros”) o un mensaje por defecto
  const [selectedLabel, setSelectedLabel] = useState(
    "Selecciona una opcion del menu",
  );

  // Muestra estado de carga, estado vacío o tarjetas con resultados.
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);

  useEffect(() => {
    // Carga los menús con sus opciones al iniciar la aplicación (una sóla vez)
    fetchMenusWithOpciones().then((menus) => setData(menus));
  }, []);

  useEffect(() => {
    if (!showBanner) {
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 6000);

    return () => clearInterval(intervalId);
  }, [showBanner, bannerImages.length]);

  // Función que selecciona una opción del menú, recibe la opción y el menú padre
  const handleSelectOption = async (submenu, menu) => {
    // Valida que existan codMenu y codOpcion, si no se recibe un submenu válido, no hace nada
    if (!submenu?.codMenu || !submenu?.codOpcion) {
      return;
    }

    // Actualiza el label mostrado al usuario y muestra el estado de carga mientras obtiene los productos desde el backend
    setSelectedLabel(`${menu.descripcion ?? menu.name} / ${submenu.name}`);
    setShowBanner(false);

    // Limpia los productos anteriores y muestra el estado de carga
    setIsLoadingProductos(true);

    try {
      // Llama al backend con el menú y opción seleccionados para obtener los productos correspondientes
      const productosData = await fetchProductos(
        submenu.codMenu,
        submenu.codOpcion,
      );
      // Actualiza el estado de productos con los datos obtenidos del backend (codMenu, codOpcion), lo que hará que se muestren las tarjetas correspondientes en pantalla
      setProductos(productosData);
    } finally {
      // Independiente del resultado de la petición, se oculta el estado de carga (Loading)
      setIsLoadingProductos(false);
    }
  };

  return (
    <div>
      <header className="h-16 text-[12px] fixed inset-0 flex-center bg-[#18181A] ">
        <nav className=" px-3.5 flex-center-between w-full max-w-7xl mx-auto">
          <div className="flex-center gap-x-3 z-999 relative">
            <a href="/" aria-label="Ir al inicio">
              <img src={Logo} alt="Nitobel" className="h-12 w-28" />
            </a>
            {/* <h3 className="text-lg font-semibold">Nitobel</h3> */}
          </div>

          <ul className="gap-x-1 lg:flex hidden">
            {/* Mapea data y renderiza DesktopMenu pasándole cada menú con sus opciones y la función handleSelectOption, que se ejecutará al hacer click en una opción del menú. */}
            {data.map((menu) => (
              <DesktopMenu
                menu={menu}
                key={menu.descripcion}
                // Le pasa onSelectOption para capturar clics en subopciones.
                onSelectOption={handleSelectOption}
              />
            ))}
          </ul>

          <div className="flex items-center pl-5 flex-nowrap">
            {/* Whatsapp */}
            <a
              className="h-10 flex items-center justify-center rounded-full hover:scale-110 transition-transform whitespace-nowrap"
              href="https://wa.me/56939457670"
              target="_blank"
              aria-label="Whatsapp"
              title="Ir a Whatsapp de Nitobel"
            >
              <img src={LogoWSP} alt="Whatsapp Icon" className="size-11" />
              <span className="text-red-500 font-extrabold px-4">
                +56 9 3945 7670
              </span>
            </a>

            <div className="lg:hidden ml-2">
              {/* Renderiza MobMenu pasándole la data completa con menús y opciones, y la función handleSelectOption para capturar clics en opciones del menú. */}
              <MobMenu menu={data} onSelectOption={handleSelectOption} />
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-24 px-4 md:px-8 lg:px-10 w-full">
        {showBanner && (
          <section
            className="fixed inset-0 z-1000 grid place-items-center p-4 bg-[rgba(0,0,0,0.72)] backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-label="Promociones Nitobel"
          >
            <div className="w-full max-w-245 bg-[linear-gradient(170deg,#1d1d20_0%,#0f0f10_100%)] border border-white/15 rounded-[20px] overflow-hidden shadow-[0_30px_65px_rgba(0,0,0,0.5)] relative">
              <button
                type="button"
                className="absolute top-3 right-3 z-2 size-9 rounded-full border border-white/20 text-white text-base bg-black/50"
                onClick={() => setShowBanner(false)}
                aria-label="Cerrar modal"
              >
                x
              </button>

              <div
                className="relative w-full overflow-hidden"
                aria-live="polite"
              >
                <button
                  type="button"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-2 size-10.5 rounded-full border border-white/25 text-white text-[1.15rem] font-bold bg-black/45"
                  onClick={goToPrevSlide}
                  aria-label="Imagen anterior"
                >
                  {"<"}
                </button>

                <div
                  className="flex w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {bannerImages.map((img, index) => (
                    <img
                      key={img}
                      src={img}
                      alt={`Banner promocional ${index + 1}`}
                      className="w-full h-[clamp(240px,23vw,430px)] flex-[0_0_100%]"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-2 size-10.5 rounded-full border border-white/25 text-white text-[1.15rem] font-bold bg-black/45"
                  onClick={goToNextSlide}
                  aria-label="Imagen siguiente"
                >
                  {">"}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-[1.2rem]">
                <div className="flex items-center justify-center min-h-45">
                  <img
                    src={Logo}
                    alt="Nitobel"
                    className="w-[min(220px,100%)] object-contain drop-shadow-[0_14px_25px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="m-0 text-zinc-300 text-[0.92rem] text-right">
                    Las imagenes cambian automaticamente cada 6 segundos.
                  </p>
                  <div
                    className="flex flex-wrap items-center gap-[0.65rem]"
                    aria-label="Selector de banners"
                  >
                    {bannerImages.map((img, index) => (
                      <button
                        key={img}
                        type="button"
                        className={`size-2.5 rounded-full border border-white/30 bg-white/25 transition-[transform,background-color,border-color] duration-180 ease-[ease] ${currentSlide === index ? "bg-red-500 border-red-500 scale-115" : ""}`}
                        onClick={() => setCurrentSlide(index)}
                        aria-label={`Ir a banner ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Muestra el label de la opción seleccionada o un mensaje por defecto si no se ha seleccionado ninguna opción. Ejemplo: “Luces Led / Delanteros” */}
        <section className="text-left mb-6">
          <h2 className="text-xl font-semibold text-white">Productos</h2>
          <p className="text-sm text-gray-400 mt-1">{selectedLabel}</p>
        </section>

        {/* Si está cargando productos, muestra mensaje de carga. */}
        {isLoadingProductos && (
          <p className="text-gray-300 text-left">Cargando productos...</p>
        )}

        {/* Si no está cargando y no hay productos, muestra mensaje. */}
        {!isLoadingProductos && productos.length === 0 && (
          <p className="text-gray-400 text-left">
            No hay productos para esta opcion o aun no has seleccionado una.
          </p>
        )}

        {/* Si no está cargando y hay productos, muestra las tarjetas con los productos obtenidos del backend. */}
        {!isLoadingProductos && productos.length > 0 && (
          <Cards productos={productos} />
        )}
      </main>
    </div>
  );
}
