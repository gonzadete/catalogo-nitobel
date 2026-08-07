const API_URL = import.meta.env.VITE_API_URL ?? "/api";

// Obtener todos los menús
export async function fetchAllMenus() {
  const response = await fetch(`${API_URL}/menu`);
  if (!response.ok) {
    throw new Error(
      `No se pudieron cargar los menús (status ${response.status} en ${API_URL}/menu)`,
    );
  }
  const data = await response.json();
  return data;
}

// Obtener un menú específico
export async function fetchMenuById(id) {
  const response = await fetch(`${API_URL}/menu/${id}`);
  if (!response.ok) {
    throw new Error(
      `No se pudo cargar el menú ${id} (status ${response.status})`,
    );
  }
  const data = await response.json();
  return data;
}

// Obtener opciones de un menú
export async function fetchOpciones(id) {
  const response = await fetch(`${API_URL}/opciones/${id}`);
  if (!response.ok) {
    throw new Error(
      `No se pudieron cargar las opciones del menú ${id} (status ${response.status})`,
    );
  }
  const data = await response.json();
  return data;
}

export async function fetchAllProductos() {
  const response = await fetch(`${API_URL}/productos`);
  if (!response.ok) throw new Error("No se pudieron cargar los productos");
  return response.json();
}

export async function fetchProductos(menu, opcion) {
  const response = await fetch(
    `${API_URL}/productos?menu=${menu}&opcion=${opcion}`,
  );
  const data = await response.json();
  return data;
}

export async function createProducto(producto) {
  const response = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "No se pudo guardar el producto");
  }

  return response.json();
}

export async function updateProducto(id, producto) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!response.ok) throw new Error("No se pudo actualizar el producto");
  return response.json();
}

export async function deleteProducto(id) {
  const response = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("No se pudo eliminar el producto");
}

// Obtener todos los menús con sus opciones
export async function fetchMenusWithOpciones() {
  try {
    const menus = await fetchAllMenus();
    console.log("Menus obtenidos del backend:", menus);

    // Para cada menú, cargar sus opciones
    const menusCompletos = await Promise.all(
      menus.map(async (menu) => {
        try {
          const opciones = await fetchOpciones(menu.codigo);

          // Transformar opciones al formato esperado por los componentes
          const subMenu = opciones.map((opcion) => ({
            name: opcion.descrip_opcion,
            desc: "",
            icon: null,
            pos: opcion.cod_opcion,
            codMenu: menu.codigo,
            codOpcion: opcion.cod_opcion,
            despliegue: opcion.despliegue,
            url_imagen: opcion.url_imagen,
          }));

          return {
            ...menu,
            subMenu: subMenu,
            gridCols: menu.gridcols || 2, // Asignar gridCols según el menú o usar un valor por defecto
          };
        } catch (error) {
          console.error(
            `Error leer opciones de un menu ${menu.codigo}:`,
            error,
          );
          return {
            ...menu,
            subMenu: [],
            gridCols: menu.gridcols || 2, // Asignar gridCols según el menú o usar un valor por defecto
          };
        }
      }),
    );

    return menusCompletos;
  } catch (error) {
    console.error("Error leer menus con opciones:", error);
    return [];
  }
}
