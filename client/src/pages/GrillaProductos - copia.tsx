import React, { useState, useEffect } from "react";
import { fetchAllProductos, fetchAllMenus, fetchOpciones } from "../api"; // Asegúrate de tener esta función en tu archivo api.ts

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
      setProductos(productos.filter((p) => p.id !== productoSeleccionado.id));
      setIsModalOpen(false);
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

    // Guardado local (Crear o Editar)
    if (modoModal === "editar" && productoSeleccionado) {
      setProductos(
        productos.map((p) =>
          p.id === productoSeleccionado.id
            ? {
                ...p,
                ...formValues,
                codigo: formValues.codigo.trim().toUpperCase(),
              }
            : p,
        ),
      );
    } else {
      const nuevoId =
        productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
      setProductos([
        {
          id: nuevoId,
          ...formValues,
          codigo: formValues.codigo.trim().toUpperCase(),
        },
        ...productos,
      ]);
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

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* CABECERA PLANILLA */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-200">
          Productos en Pagina Web www.nitobel.cl
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

      {/* TABLA DE PRODUCTOS */}
      {productos.length > 0 ? (
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
              {productos.map((producto, idx) => (
                <tr
                  key={producto.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-200"}
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
                  <input
                    type="text"
                    required
                    disabled={esModoLectura}
                    maxLength={25}
                    value={formValues.codigo}
                    onChange={(e) =>
                      setFormValues({ ...formValues, codigo: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 text-black font-semibold rounded-lg text-sm font-mono uppercase disabled:bg-gray-100"
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
