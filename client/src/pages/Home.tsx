import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import DesktopMenu from "../components/DesktopMenu";
import MobMenu from "../components/MobMenu";
import Cards from "../components/Cards";
import { fetchMenusWithOpciones, fetchProductos } from "../api";
import ListaProduc from "../components/ui/ListaProduc";
import { setAdminAuthenticated } from "./auth";

const Home = () => {
  const navigate = useNavigate();
  const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD ?? "";

  // pide al backend menus con sus opciones y productos
  const [data, setData] = useState([]);

  // Productos a mostrar en pantalla según opción seleccionada
  const [productos, setProductos] = useState([]);

  // Modo de despliegue definido en opciones (I: imagen/cards, L: lista)
  const [modoDespliegue, setModoDespliegue] = useState("I");

  // Label que muestra la opción seleccionada o un mensaje por defecto
  const [selectedLabel, setSelectedLabel] = useState(
    "Selecciona una opcion del menu",
  );

  // Muestra estado de carga, estado vacío o tarjetas con resultados
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);

  // Almacena la opción seleccionada para mostrar su imagen
  const [selectedOption, setSelectedOption] = useState(null);

  // Modal de acceso administrativo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    fetchMenusWithOpciones().then((menus) => setData(menus));
  }, []);

  // Función que selecciona una opción del menú, recibe la opción y el menú padre
  const handleSelectOption = async (submenu, menu) => {
    // Valida que existan codMenu y codOpcion, si no se recibe un submenu válido, no hace nada
    if (!submenu?.codMenu || !submenu?.codOpcion) {
      return;
    }

    // Guarda la opción seleccionada para mostrar su imagen
    setSelectedOption(submenu);

    // Actualiza el label mostrado al usuario y muestra el estado de carga mientras obtiene los productos desde el backend
    setSelectedLabel(`${menu.descripcion ?? menu.name} / ${submenu.name}`);
    setModoDespliegue(submenu?.despliegue ?? submenu?.despliegue ?? "I");
    // console.log("Submenu seleccionado:", submenu, "Menu padre:", menu);

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

  // console.log("Data de menús con opciones en Home:", data);
  // console.log("Productos a mostrar:", productos);
  // console.log("Modo de despliegue actual:", modoDespliegue);
  const mostrarCards = modoDespliegue?.toUpperCase().includes("I");
  const mostrarLista = modoDespliegue?.toUpperCase().includes("L");

  const handleOpenModal = () => {
    setPassword("");
    setPasswordError("");
    setIsModalOpen(true);
  };

  const handleSubmitPassword = (event) => {
    event.preventDefault();

    if (password.trim() === ACCESS_PASSWORD) {
      setAdminAuthenticated(true);
      setIsModalOpen(false);
      navigate("/create");
      return;
    }

    setPasswordError("Clave incorrecta. Intenta nuevamente.");
  };

  return (
    <div>
      <header className="h-16 text-[12px] fixed inset-0 flex-center bg-[#e3e3ee] position-sticky">
        <nav className=" px-3.5 flex-center-between w-full max-w-7xl mx-auto">
          <button
            type="button"
            onClick={handleOpenModal}
            className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            Acceso
          </button>
          <div className="flex-center gap-x-3 z-999 relative">
            <img
              src={Logo}
              alt="Nitobel"
              className="h-12 w-28 cursor-pointer"
              onClick={() => window.location.reload()}
            />
            {/* <h3 className="text-lg font-semibold">Nitobel</h3> */}
          </div>

          <ul className="gap-x-1 lg:flex hidden top-0 left-0 right-0 z-999">
            {/* Mapea data y renderiza DesktopMenu pasándole cada menú con sus opciones y la función +, que se ejecutará al hacer click en una opción del menú. */}
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
              <svg viewBox="0 0 64 64" aria-hidden="true" className="size-11">
                <circle cx="32" cy="32" r="30" fill="#25D366" />
                <path
                  fill="#fff"
                  d="M46.7 17.3A20.4 20.4 0 0 0 32 11.2C20.7 11.2 11.5 20.3 11.5 31.6c0 3.6 1 7.1 2.8 10.1L11.1 53l11.6-3c2.8 1.5 6 2.3 9.2 2.3h.1c11.3 0 20.5-9.1 20.5-20.4 0-5.5-2.1-10.6-5.8-14.6Zm-14.8 31c-3 0-5.9-.8-8.4-2.3l-.6-.3-6.9 1.8 1.8-6.7-.4-.7a17 17 0 0 1-2.6-9c0-9.4 7.7-17 17.1-17 4.5 0 8.7 1.7 11.9 4.9a16.8 16.8 0 0 1 4.9 11.9c0 9.4-7.7 17-17 17Zm9.4-12.8c-.5-.2-2.8-1.4-3.2-1.5-.4-.1-.7-.2-1 .2-.3.5-1.1 1.5-1.4 1.8-.3.3-.5.4-1 .2-.5-.2-2-0.7-3.8-2.2-1.4-1.2-2.4-2.7-2.7-3.2-.3-.5 0-.8.2-1 .2-.2.5-.5.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1-2.5-1.4-3.4-.4-.9-.8-.8-1-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 4s1.7 4.7 1.9 5c.2.3 3.3 5 8 7 1.1.5 2 .8 2.7 1 .8.2 1.6.2 2.2.1.7-.1 2.8-1.1 3.2-2.2.4-1 .4-1.8.3-2-.1-.2-.4-.3-.9-.5Z"
                />
              </svg>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">
                Acceso administrativo
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Ingresa la clave para abrir la sección de archivos.
            </p>

            <form onSubmit={handleSubmitPassword} className="mt-4 space-y-3">
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (passwordError) {
                    setPasswordError("");
                  }
                }}
                placeholder="Clave"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-black outline-none ring-0 focus:border-blue-500"
              />

              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <img
        src="https://www.dropbox.com/scl/fi/e34r9i69kqi4qr9v5jhjg/BannerFocos.jpg?rlkey=b7lmz6gt25arqa6mzb1i3yg0m&dl=1"
        alt="Banner de Nitobel"
        title="Nitobel"
        className="border-0 w-6xl h-1/2 md:h-1/2 lg:h-1/2 object-cover rounded-lg mx-auto mt-20"
      />

      <main className="px-4 md:px-8 lg:px-10 w-full">
        {/* Muestra el label de la opción seleccionada o un mensaje por defecto si no se ha seleccionado ninguna opción. Ejemplo: “Luces Led / Delanteros” */}
        <section className="text-left">
          <h2 className="mt-3 text-xl font-semibold text-black">Productos</h2>
          <p className="text-md text-black mt-1">{selectedLabel}</p>
        </section>

        {/* Si está cargando productos, muestra mensaje de carga. */}
        {isLoadingProductos && (
          <p className="text-gray-800 text-left">Cargando productos...</p>
        )}

        {/* Si no está cargando y no hay productos, muestra mensaje. */}
        {!isLoadingProductos && productos.length === 0 && (
          <p className="text-gray-700 text-left">
            No hay productos para esta opción o aún no has seleccionado una.
          </p>
        )}

        {/* Si no está cargando y hay productos, muestra cards o lista según 'despliegue' de la opcion. */}
        {!isLoadingProductos && productos.length > 0 && (
          <>
            {mostrarLista && !mostrarCards ? (
              <ListaProduc
                selectedOption={selectedOption}
                productos={productos}
              />
            ) : (
              <Cards productos={productos} />
            )}
          </>
        )}
      </main>

      <footer className="mt-12 border-t border-white/10 bg-[#e3e3ee] px-4 py-8 md:px-8 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl gap-6 text-sm text-zinc-300 md:grid-cols-3">
          <div>
            <h3 className="text-base font-semibold text-black">
              Acerca de nosotros
            </h3>
            <p className="mt-2 text-black">
              Nuestra empresa lleva 30 años sirviendo a nuestros clientes.
              Importamos el 80% de los productos que comercializamos, de este
              modo conseguimos precios que la competencia no puede ofrecer.
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-black">Contacto</h4>
            <ul className="mt-2 space-y-1 text-black">
              <li>
                WhatsApp:{" "}
                <a
                  href="https://wa.me/56939457670"
                  className="text-blue-400 hover:underline"
                >
                  +56 9 3945 7670
                </a>
              </li>
              <li>Teléfono: +56 65 2 348 500</li>
              <li>
                Dirección: Av. Circunvalación 276 (esquina San Patricio), Puerto
                Montt, Chile
              </li>
              <li>
                Correo electrónico:{" "}
                <a
                  href="mailto:ventas@nitobel.cl"
                  className="text-blue-400 hover:underline"
                >
                  ventas@nitobel.cl
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-semibold text-black">Horarios</h4>
            <ul className="mt-2 space-y-1 text-black">
              <li>Lunes a Viernes: 09:00 - 17:30</li>
              <li>Sabado: 09:30 - 13:00</li>
              <li>Domingo: Cerrado</li>
            </ul>
          </div>
        </div>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2989.728365989245!2d-72.96069111065071!3d-41.46680645852815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x96183ba7ff795cd1%3A0xdfba6162d875ca9!2sAv.%20Circunvalaci%C3%B3n%20276%2C%205501788%20Puerto%20Montt%2C%20Los%20Lagos!5e0!3m2!1ses!2scl!4v1781897173878!5m2!1ses!2scl"
          className="w-full h-90 mt-8 rounded-lg border-0"
          //   width="800"
          //   height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicacion Nitobel en Google Maps"
        ></iframe>

        <div className="mx-auto mt-6 w-full max-w-7xl border-t border-white/10 pt-4 text-xs text-zinc-600">
          <p>
            © {new Date().getFullYear()} Nitobel Software. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Home;
