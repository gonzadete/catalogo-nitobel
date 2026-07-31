import React, { useState, useEffect } from "react";
import InputMask from "../components/ui/InputMask";
import {
  createProducto,
  deleteProducto,
  fetchAllProductos,
  fetchAllMenus,
  fetchOpciones,
  updateProducto,
} from "../api";

type MenuApiItem = {
  id?: number;
  codigo: string;
  descripcion: string;
};

type OpcionApiItem = {
  id?: number;
  cod_opcion: string;
  descrip_opcion: string;
  cod_menu?: string;
  despliegue?: string;
};

interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  menu: string;
  opcion: string;
  imagen_url: string;
  stock: number;
  precio: number;
}

export const GrillaProductos: React.FC = () => {
  // Estados de datos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ESTADOS PARA EL MODAL DE AGREGAR
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  // Estados de filtros
  const [filtroCodigo, setFiltroCodigo] = useState<string>("");
  const [filtroDescripcion, setFiltroDescripcion] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState<number>(10);

  // // ================= ESTADOS PARA COMBOS RELACIONADOS =================
  const [menus, setMenus] = useState<MenuApiItem[]>([]);
  // const [todasOpciones, setTodasOpciones] = useState<Opcion[]>([]);
  const [opcionesFiltradas, setOpcionesFiltradas] = useState<OpcionApiItem[]>(
    [],
  );

  // Estados para el modal (formulario, modo y producto seleccionado)
  const [formValues, setFormValues] = useState({
    codigo: "",
    descripcion: "",
    menu: "",
    opcion: "",
    imagen_url: "",
    stock: 0,
    precio: 0,
  });
  const [modoModal, setModoModal] = useState<"crear" | "editar" | "eliminar">(
    "crear",
  );
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [todasOpciones, setTodasOpciones] = useState<OpcionApiItem[]>([]);

  // 1. Carga inicial de datos desde la API (Productos y Menús)
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargando(true);

        const [datosProductos, datosMenus] = await Promise.all([
          fetchAllProductos(),
          fetchAllMenus(),
        ]);

        setProductos(datosProductos);
        setMenus(datosMenus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setCargando(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  // 2. Manejador para cambios del menú: carga opciones desde la API y filtra
  const handleMenuChange = async (menuCodigo: string) => {
    setFormValues({ ...formValues, menu: menuCodigo, opcion: "" });
    if (menuCodigo === "") {
      setOpcionesFiltradas([]);
    } else {
      try {
        const opciones = await fetchOpciones(menuCodigo);
        setOpcionesFiltradas(opciones);
        setTodasOpciones((prev) => {
          const nuevas = opciones.filter(
            (o: OpcionApiItem) =>
              !prev.some(
                (p) =>
                  p.cod_opcion === o.cod_opcion && p.cod_menu === o.cod_menu,
              ),
          );
          return [...prev, ...nuevas];
        });
      } catch {
        setOpcionesFiltradas([]);
      }
    }
  };

  // ================= MANEJADORES DE APERTURA DEL MODAL =================
  const handleAbrirCrear = () => {
    setModoModal("crear");
    setProductoSeleccionado(null);
    setErrorModal(null);
    setFormValues({
      codigo: "",
      descripcion: "",
      menu: "",
      opcion: "",
      imagen_url: "",
      stock: 0,
      precio: 0,
    });
    setIsModalOpen(true);
  };

  const handleAbrirEditar = async (producto: Producto) => {
    setModoModal("editar");
    setProductoSeleccionado(producto);
    setErrorModal(null);

    // Cargar opciones del menú del producto
    try {
      const opciones = await fetchOpciones(producto.menu);
      setOpcionesFiltradas(opciones);
    } catch {
      setOpcionesFiltradas([]);
    }

    setFormValues({
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      menu: producto.menu,
      opcion: producto.opcion,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
      precio: producto.precio,
    });
    setIsModalOpen(true);
  };

  const handleAbrirEliminar = (producto: Producto) => {
    setModoModal("eliminar");
    setProductoSeleccionado(producto);
    setErrorModal(null);
    // Filtrar opciones según el menú del producto
    const opcionesDelMenu = todasOpciones.filter(
      (opc) => opc.cod_menu === producto.menu,
    );
    setOpcionesFiltradas(opcionesDelMenu);
    setFormValues({
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      menu: producto.menu,
      opcion: producto.opcion,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
      precio: producto.precio,
    });
    setIsModalOpen(true);
  };

  const handleProcesarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);

    if (modoModal === "eliminar" && productoSeleccionado) {
      try {
        await deleteProducto(productoSeleccionado.id);
        setProductos(productos.filter((p) => p.id !== productoSeleccionado.id));
        setIsModalOpen(false);
      } catch (err) {
        setErrorModal(
          err instanceof Error
            ? err.message
            : "No se pudo eliminar el producto",
        );
      }
      return;
    }

    const codigoDuplicado = productos.some((p) => {
      const mismoCodigo =
        p.codigo.trim().toLowerCase() ===
        formValues.codigo.trim().toLowerCase();
      const esElMismoProducto =
        productoSeleccionado && p.id === productoSeleccionado.id;
      return mismoCodigo && !esElMismoProducto;
    });

    if (codigoDuplicado) {
      setErrorModal(
        `El código "${formValues.codigo}" ya existe en el catálogo.`,
      );
      return;
    }

    // Guardado (Crear o Editar)
    if (modoModal === "editar" && productoSeleccionado) {
      try {
        const payload = {
          ...formValues,
          codigo: formValues.codigo.trim().toUpperCase(),
        };
        const productoActualizado = await updateProducto(
          productoSeleccionado.id,
          payload,
        );

        setProductos(
          productos.map((p) =>
            p.id === productoSeleccionado.id ? productoActualizado : p,
          ),
        );
      } catch (err) {
        setErrorModal(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el producto",
        );
        return;
      }
    } else {
      try {
        const payload = {
          ...formValues,
          codigo: formValues.codigo.trim().toUpperCase(),
        };
        const productoCreado = await createProducto(payload);
        setProductos([productoCreado, ...productos]);
      } catch (err) {
        setErrorModal(
          err instanceof Error ? err.message : "No se pudo guardar el producto",
        );
        return;
      }
    }
    setIsModalOpen(false);
  };

  if (cargando)
    return (
      <div className="text-center py-20 font-medium">
        Sincronizando tablas del servidor...
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded max-w-md mx-auto my-8">
        {error}
      </div>
    );

  const esModoLectura = modoModal === "eliminar";
  const esCodigoBloqueado = modoModal !== "crear";

  const productosFiltrados = productos.filter(
    (p) =>
      p.codigo.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
      p.descripcion.toLowerCase().includes(filtroDescripcion.toLowerCase()),
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(productosFiltrados.length / registrosPorPagina),
  );

  const paginaActualValida = Math.min(paginaActual, totalPaginas);
  const indiceInicio = (paginaActualValida - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const productosPaginados = productosFiltrados.slice(indiceInicio, indiceFin);
  const inicioVisible = productosFiltrados.length === 0 ? 0 : indiceInicio + 1;
  const finVisible = Math.min(indiceFin, productosFiltrados.length);

  const paginasVisibles = Array.from(
    { length: totalPaginas },
    (_, index) => index + 1,
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPaginas ||
      Math.abs(page - paginaActualValida) <= 1,
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* CABECERA PLANILLA */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-600">
          Productos en www.nitobel.cl
        </h2>
        <button
          onClick={handleAbrirCrear}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Agregar Producto
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Filtrar por código..."
          value={filtroCodigo}
          onChange={(e) => {
            setFiltroCodigo(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="Filtrar por descripción..."
          value={filtroDescripcion}
          onChange={(e) => {
            setFiltroDescripcion(e.target.value);
            setPaginaActual(1);
          }}
          className="w-full sm:w-72 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {(filtroCodigo || filtroDescripcion) && (
          <button
            onClick={() => {
              setFiltroCodigo("");
              setFiltroDescripcion("");
              setPaginaActual(1);
            }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
        <span className="self-center text-sm text-gray-500">
          {productosFiltrados.length} de {productos.length} productos
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="registrosPorPagina" className="text-sm text-gray-500">
            Mostrar
          </label>
          <select
            id="registrosPorPagina"
            value={registrosPorPagina}
            onChange={(e) => {
              setRegistrosPorPagina(Number(e.target.value));
              setPaginaActual(1);
            }}
            className="px-2 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-500">registros</span>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS */}
      {productosFiltrados.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-800">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="bg-indigo-600 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Menú
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Opción
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Precio
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold">
                  Stock
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.map((producto, idx) => (
                <tr
                  key={producto.id}
                  className={
                    (indiceInicio + idx) % 2 === 0 ? "bg-white" : "bg-gray-200"
                  }
                >
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {producto.id}
                  </td>
                  <td className="px-6 py-3 text-sm font-mono text-gray-800">
                    {producto.codigo}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {producto.descripcion}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {producto.menu}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-800">
                    {producto.opcion}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-800">
                    ${producto.precio}
                  </td>
                  <td className="px-6 py-3 text-sm text-right text-gray-800">
                    {producto.stock}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleAbrirEditar(producto)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded cursor-pointer transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleAbrirEliminar(producto)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded cursor-pointer transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay productos registrados
        </div>
      )}

      {productosFiltrados.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-600">
            Mostrando {inicioVisible} a {finVisible} de{" "}
            {productosFiltrados.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPaginaActual((prev) =>
                  Math.max(Math.min(prev, totalPaginas) - 1, 1),
                )
              }
              disabled={paginaActualValida === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>

            {paginasVisibles.map((page, index) => {
              const prevPage = paginasVisibles[index - 1];
              const mostrarPuntos = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {mostrarPuntos && (
                    <span className="px-1 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPaginaActual(page)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      page === paginaActualValida
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}

            <button
              onClick={() =>
                setPaginaActual((prev) =>
                  Math.min(Math.min(prev, totalPaginas) + 1, totalPaginas),
                )
              }
              disabled={paginaActualValida === totalPaginas}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* ... [Aquí se localiza la tabla de datos y acciones anterior] ... */}

      {/* ================= MODAL VENTA EMERGENTE CON SELECTORES EN CASCADA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera Adaptable */}
            <div
              className={`px-6 py-4 border-b border-gray-200 flex justify-between items-center ${
                modoModal === "eliminar" ? "bg-red-50" : "bg-gray-50"
              }`}
            >
              <h3
                className={`text-lg font-bold ${modoModal === "eliminar" ? "text-red-800" : "text-gray-800"}`}
              >
                {modoModal === "crear" && "Registrar Nuevo Producto"}
                {modoModal === "editar" &&
                  productoSeleccionado &&
                  `Editar Producto (ID: ${productoSeleccionado.id})`}
                {modoModal === "eliminar" &&
                  productoSeleccionado &&
                  `¿Confirmar Eliminación del Producto ID: ${productoSeleccionado.id}?`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleProcesarFormulario} className="p-6 space-y-4">
              {modoModal === "eliminar" ? (
                <p className="text-sm font-semibold text-red-700 bg-red-100/50 p-2.5 rounded border border-red-200">
                  ⚠️ Atención: Esta operación borrará permanentemente el
                  registro.
                </p>
              ) : (
                errorModal && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-red-700 text-xs font-medium">
                    {errorModal}
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Código */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Código
                  </label>
                  <InputMask
                    name="codigo"
                    mask="AAA-000000000"
                    definitions={{ A: /[A-Za-z0-9]/ }}
                    placeholder="ABC-123456789"
                    value={formValues.codigo}
                    disabled={esCodigoBloqueado}
                    autoFocus={!esCodigoBloqueado}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        codigo: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </div>

                {/* Descripción */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    required
                    disabled={esModoLectura}
                    maxLength={50}
                    value={formValues.descripcion}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        descripcion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* SELECTOR SELECT: Menú (Origen: TABLE menu) */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Menú Relacionado *
                  </label>
                  <select
                    required
                    disabled={esModoLectura}
                    value={formValues.menu}
                    onChange={(e) => handleMenuChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Seleccione...</option>
                    {menus.map((m) => (
                      <option key={m.id} value={m.codigo}>
                        [{m.codigo}] {m.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SELECTOR SELECT: Opción en Cascada (Origen: TABLE opciones) */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Opción Disponible *
                  </label>
                  <select
                    required
                    disabled={esModoLectura || formValues.menu === ""}
                    value={formValues.opcion}
                    onChange={(e) =>
                      setFormValues({ ...formValues, opcion: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black  rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {formValues.menu === ""
                        ? "Primero elija Menú..."
                        : "Seleccione..."}
                    </option>
                    {opcionesFiltradas.map((o) => (
                      <option key={o.id} value={o.cod_opcion}>
                        [{o.cod_opcion}] {o.descrip_opcion}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    disabled={esModoLectura}
                    min={0}
                    value={formValues.precio || ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        precio: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    disabled={esModoLectura}
                    min={0}
                    value={formValues.stock || ""}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        stock: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg text-sm disabled:bg-gray-100"
                  />
                </div>

                {/* URL Imagen */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                    URL Imagen
                  </label>
                  <input
                    type="url"
                    disabled={esModoLectura}
                    value={formValues.imagen_url}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        imagen_url: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg text-sm disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer ${
                    modoModal === "eliminar"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {modoModal === "crear" && "Crear Producto"}
                  {modoModal === "editar" && "Guardar Cambios"}
                  {modoModal === "eliminar" && "Eliminar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
