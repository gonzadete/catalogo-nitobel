import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
} from "material-react-table";
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

// Importación de tus funciones personalizadas de acceso a BD
import {
  fetchAllProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  fetchAllMenus,
  fetchOpciones,
} from "../api";

// ==========================================
// INTERFACES (Definiciones de TypeScript)
// ==========================================
interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  menu: string;
  opcion: string;
  imagen_url: string;
  stock: number;
  PRECIO: number | string;
}

interface MenuDB {
  codigo: string;
  descripcion: string;
}

interface OpcionDB {
  cod_menu: string;
  cod_opcion: string;
  descrip_opcion: string;
  url_imagen: string;
}

interface ValidationErrors {
  codigo?: string;
}

const ProductosTable: React.FC = () => {
  const [data, setData] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const [menusDB, setMenusDB] = useState<MenuDB[]>([]);
  // Almacenamos de forma dinámica las opciones que correspondan al menú activo en el modal
  const [opcionesFiltradas, setOpcionesFiltradas] = useState<OpcionDB[]>([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchAllProductos(), fetchAllMenus()])
      .then(([productos, menus]) => {
        if (!isMounted) return;
        setData(productos);
        setMenusDB(menus);
      })
      .catch((error) => {
        console.error("Error cargando catálogos iniciales:", error);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Función auxiliar para cargar opciones dinámicamente cuando el usuario interactúe con el modal
  const handleMenuChangeFetch = async (menuCodigo: string) => {
    if (!menuCodigo) {
      setOpcionesFiltradas([]);
      return;
    }
    try {
      const opciones = await fetchOpciones(menuCodigo);
      setOpcionesFiltradas(opciones);
    } catch (error) {
      console.error("Error cargando opciones del menú:", error);
    }
  };

  const validateCodigo = (
    codigo: string,
    currentId: number | null = null,
  ): string => {
    if (!codigo || codigo.trim() === "") return "El código es requerido";
    const existeCodigo = data.some(
      (item) =>
        item.codigo.toLowerCase() === codigo.toLowerCase() &&
        item.id !== currentId,
    );
    if (existeCodigo) return "Este código ya está registrado";
    return "";
  };

  // Guardar nuevo registro (CREATE) utilizando tu función createProducto
  const handleCreateProduct = async ({
    values,
    table,
  }: {
    values: Producto;
    table: MRT_TableInstance<Producto>;
  }): Promise<void> => {
    const codigoError = validateCodigo(values.codigo);
    if (codigoError) {
      setValidationErrors({ codigo: codigoError });
      return;
    }
    try {
      const newProduct = await createProducto(values);
      setData([...data, newProduct]);
      console.log("Producto creado:", newProduct);
      setValidationErrors({});
      table.setCreatingRow(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  // Guardar cambios (UPDATE) utilizando tu función updateProducto
  const handleSaveRow = async ({
    table,
    row,
    values,
  }: {
    table: MRT_TableInstance<Producto>;
    row: MRT_Row<Producto>;
    values: Producto;
  }): Promise<void> => {
    const codigoError = validateCodigo(values.codigo, row.original.id);
    if (codigoError) {
      setValidationErrors({ codigo: codigoError });
      return;
    }
    try {
      const updatedProduct = await updateProducto(row.original.id, values);
      const updatedData = [...data];
      updatedData[row.index] = updatedProduct;
      setData(updatedData);
      setValidationErrors({});
      table.setEditingRow(null);
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  // Eliminar fila (DELETE) utilizando tu función deleteProducto
  const handleDeleteRow = async (row: MRT_Row<Producto>): Promise<void> => {
    if (window.confirm(`¿Eliminar producto: ${row.original.descripcion}?`)) {
      try {
        await deleteProducto(row.original.id);
        setData(data.filter((item) => item.id !== row.original.id));
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const columns = useMemo<MRT_ColumnDef<Producto>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        enableEditing: false,
        size: 70,
      },
      {
        accessorKey: "codigo",
        header: "Código",
        muiEditTextFieldProps: {
          required: true,
          error: !!validationErrors.codigo,
          helperText: validationErrors.codigo,
          onFocus: () => setValidationErrors({}),
        },
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        muiEditTextFieldProps: { required: true },
      },
      {
        accessorKey: "menu",
        header: "Menú",
        size: 120,
        Edit: ({ cell, table }) => {
          type RowDraft = { _values?: Partial<Producto> };
          const creatingRowValues = (
            table.getState().creatingRow as unknown as RowDraft | null
          )?._values;
          const editingRowValues = (
            table.getState().editingRow as unknown as RowDraft | null
          )?._values;
          const value = table.getState().creatingRow
            ? creatingRowValues?.menu || ""
            : editingRowValues?.menu || (cell.getValue() as string) || "";
          return (
            <TextField
              select
              label="Menú"
              value={value}
              required
              fullWidth
              onChange={(e) => {
                const nuevoMenu = e.target.value;

                // Disparar la consulta asíncrona hacia la BD para traer las opciones de este menú
                handleMenuChangeFetch(nuevoMenu);

                const updateState = (prev: MRT_Row<Producto> | null) => {
                  if (!prev) return null;
                  const prevRow = prev as unknown as {
                    _values?: Partial<Producto>;
                  };
                  return {
                    ...prev,
                    _values: {
                      ...(prevRow._values ?? {}),
                      menu: nuevoMenu,
                      opcion: "",
                      imagen_url: "",
                    },
                  } as unknown as MRT_Row<Producto>;
                };

                if (table.getState().creatingRow) {
                  table.setCreatingRow(updateState);
                } else if (table.getState().editingRow) {
                  table.setEditingRow(updateState);
                }
              }}
            >
              {menusDB.map((m) => (
                <MenuItem key={m.codigo} value={m.codigo}>
                  {m.descripcion} ({m.codigo})
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
      {
        accessorKey: "opcion",
        header: "Opción",
        size: 120,
        Edit: ({ cell, table }) => {
          type RowDraft = { _values?: Partial<Producto> };
          const creatingRowValues = (
            table.getState().creatingRow as unknown as RowDraft | null
          )?._values;
          const editingRowValues = (
            table.getState().editingRow as unknown as RowDraft | null
          )?._values;
          const currentMenuValue = table.getState().creatingRow
            ? creatingRowValues?.menu
            : editingRowValues?.menu;

          const value = table.getState().creatingRow
            ? creatingRowValues?.opcion || ""
            : editingRowValues?.opcion || (cell.getValue() as string) || "";

          // Ejecutar la carga asíncrona si entramos en edición y hay un menú previo pero el estado de opciones está vacío
          if (
            currentMenuValue &&
            opcionesFiltradas.length === 0 &&
            table.getState().editingRow
          ) {
            handleMenuChangeFetch(currentMenuValue);
          }

          return (
            <TextField
              select
              label="Opción"
              value={value}
              required
              fullWidth
              disabled={!currentMenuValue}
              helperText={!currentMenuValue ? "Selecciona un menú primero" : ""}
              onChange={(e) => {
                const nuevaOpcion = e.target.value;
                // Buscar localmente dentro del pool de opciones cargadas la URL de la imagen
                const opcionSeleccionada = opcionesFiltradas.find(
                  (o) => o.cod_opcion === nuevaOpcion,
                );
                const nuevaImagenUrl = opcionSeleccionada
                  ? opcionSeleccionada.url_imagen
                  : "";

                const updateState = (prev: MRT_Row<Producto> | null) => {
                  if (!prev) return null;
                  const prevRow = prev as unknown as {
                    _values?: Partial<Producto>;
                  };
                  return {
                    ...prev,
                    _values: {
                      ...(prevRow._values ?? {}),
                      opcion: nuevaOpcion,
                      imagen_url: nuevaImagenUrl,
                    },
                  } as unknown as MRT_Row<Producto>;
                };

                if (table.getState().creatingRow) {
                  table.setCreatingRow(updateState);
                } else if (table.getState().editingRow) {
                  table.setEditingRow(updateState);
                }
              }}
            >
              {opcionesFiltradas.map((o) => (
                <MenuItem key={o.cod_opcion} value={o.cod_opcion}>
                  {o.descrip_opcion} ({o.cod_opcion})
                </MenuItem>
              ))}
            </TextField>
          );
        },
      },
      {
        accessorKey: "imagen_url",
        header: "URL Imagen",
        muiEditTextFieldProps: {
          InputLabelProps: { shrink: true },
          placeholder: "Se autocompletará automáticamente",
        },
        Cell: ({ cell }) => {
          const url = cell.getValue() as string;
          return url ? (
            <img
              src={url}
              alt="Producto"
              className="w-10 h-10 rounded-md object-cover border border-slate-200 shadow-sm"
            />
          ) : (
            <span className="text-xs text-slate-400 italic">Sin imagen</span>
          );
        },
      },
      {
        accessorKey: "stock",
        header: "Stock",
        type: "number",
        muiEditTextFieldProps: { type: "number" },
        size: 90,
        // Alerta visual de stock con Tailwind
        Cell: ({ cell }) => {
          const stock = cell.getValue() as number;
          return (
            <span
              className={`font-semibold ${stock <= 5 ? "text-red-600" : "text-slate-700"}`}
            >
              {stock}
            </span>
          );
        },
      },
      {
        accessorKey: "PRECIO",
        header: "Precio",
        muiEditTextFieldProps: { type: "number", inputProps: { step: "0.01" } },
        size: 100,
        // Formato contable verde con Tailwind
        Cell: ({ cell }) => {
          const precio = parseFloat((cell.getValue() as string) || "0");
          return (
            <span className="font-mono text-emerald-700 font-medium">
              ${precio.toFixed(2)}
            </span>
          );
        },
      },
    ],
    [validationErrors, menusDB, opcionesFiltradas],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading },
    enableEditing: true,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    onCreatingRowSave: handleCreateProduct,
    onEditingRowSave: handleSaveRow,
    // Limpieza de estados al cerrar modales
    onCreatingRowCancel: () => {
      setValidationErrors({});
      setOpcionesFiltradas([]);
    },
    onEditingRowCancel: () => {
      setValidationErrors({});
      setOpcionesFiltradas([]);
    },

    // Inyección de botón de creación con Tailwind CSS
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="p-2">
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => table.setCreatingRow(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium normal-case shadow-sm px-4 py-2 rounded-lg transitions-colors duration-200"
        >
          Crear Producto
        </Button>
      </div>
    ),

    // Botones de acción de fila estilizados
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Editar">
          <IconButton
            onClick={() => {
              handleMenuChangeFetch(row.original.menu); // Precarga síncrona
              table.setEditingRow(row);
            }}
            className="text-slate-600 hover:text-blue-600 transition-colors"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            color="error"
            onClick={() => handleDeleteRow(row)}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    // Estructura contenedora del catálogo usando Tailwind CSS
    <div className="w-full p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden p-4">
        <div className="mb-4 px-2">
          <h1 className="text-2xl font-bold text-slate-800">
            Catálogo de Productos
          </h1>
          <p className="text-sm text-slate-500">
            Administración de inventarios, asignación de menús y tarifas en
            tiempo real usando Fetch nativo.
          </p>
        </div>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default ProductosTable;
