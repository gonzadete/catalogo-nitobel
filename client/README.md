## Inicio

npm create vite@latest

eliminar:   src/assets
            app.css
limpiar     app.jsx   

instalar tailwindcss usando vite:
en Terminal: cd carpetacreada
npm install tailwindcss @tailwindcss/vite

en vite.config.js agregar:
import tailwindcss from '@tailwindcss/vite'
y en plugins agregar tailwindcss()

en index.css eliminar todo el contenido y agregar:
@import "tailwindcss";

npm install react-router

npm install
npm run dev

npm install lucide-react
npm install framer-motion



## APP.jsx
Este componente es el “contenedor principal” de la app: carga menús, escucha la opción que el usuario selecciona y muestra tarjetas de productos.

# Flujo general
1. Al montar la app, pide al backend todos los menús con sus opciones.
2. Renderiza navegación desktop y mobile con esos datos.
3. Cuando eliges una subopción, consulta productos filtrados por menú/opción.
4. Muestra estado de carga, estado vacío o tarjetas con resultados.

# Cómo está organizado en App
- Importa componentes y funciones API en App.jsx:1.
- Define estados principales en App.jsx:10:
  - data: menús + subopciones para la navegación.
  - productos: lista de productos retornados por la API.
  - selectedLabel: texto de contexto (ejemplo: “Luces Led / Delanteros”).
  - isLoadingProductos: bandera de carga para feedback visual.


# Carga inicial
- En el useEffect de App.jsx:15, se ejecuta fetchMenusWithOpciones una sola vez     (dependencias vacías).
- Ese resultado llena data con la estructura que usan DesktopMenu y MobMenu.

# Selección de opción y búsqueda de productos
- La función handleSelectOption en App.jsx:19:
  - Valida que existan codMenu y codOpcion.
  - Actualiza el label mostrado al usuario.
  - Activa loading.
  - Llama fetchProductos(codMenu, codOpcion).
  - Guarda el resultado en productos.
  - Desactiva loading al final (aunque falle la petición).

# Render del header y navegación
- Header fijo en App.jsx:35.
- Menú desktop:
  - Recorre data y renderiza DesktopMenu en App.jsx:43.
  - Le pasa onSelectOption para capturar clics en subopciones.
- Menú mobile:
  - Renderiza MobMenu con los mismos datos/callback en App.jsx:67.


# Render del contenido principal
- Título y subtítulo contextual en App.jsx:74.
- Estados condicionales:
  - Cargando: App.jsx:79
  - Sin resultados o sin selección: App.jsx:83
  - Con resultados: renderiza Cards en App.jsx:89

  ChevronDown Indica submenú expandible: Solo se muestra cuando menú tiene opciones (cuando hasSubMenu es true)
              Al hacer hover sobre el elemento del menú, la flecha rota 180 grados (group-hover/link:rotate-180), señalando visualmente que el submenú se puede expandir/contraer

  MotionDiv   Es un contenedor animado que muestra/oculta el submenú con transiciones suaves cuando el usuario hace hover sobre el menú 
              Aplica animaciones suaves: Usa las variantes definidas en subMenuAnimate para:
                      Aparecer cuando hay hover (animate="enter")
                      Desaparecer cuando no hay hover (animate="exit")            
  
En resumen: App.jsx coordina datos y UI. Los menús disparan eventos, App consulta productos al backend y delega la visualización final al componente Cards.

##  Instalar

npm i react-router
npm i react-router-dom
npm i react-hook-form
npm i zod                 X
npm i @hookform/resolvers X
npm i react-imask     o  react-input-mask   o  react-number-format

Para ProductosTable.tsx :
npm i @mui/icons-material @mui/material @emotion/styled @emotion/react   
npm i material-react-table

##  Revisar 

rsuite:  
  DatePicker, 
  SelectPicker, 
  Form, 
  Input, 
  InputGroup, 
  type InputProps, 
  EyeCloseIcon, 
  VisibleIcon, 
  Button, 
  Modal


  // 3. useEffect para llamar a la API al cargar el componente
  useEffect(() => {
    const obtenerProductos = async () => {
      try {
        setCargando(true);
        // fetchAllProductos ya devuelve los datos directamente
        const datos = await fetchAllProductos();
        setProductos(datos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocurrió un error inesperado",
        );
      } finally {
        setCargando(false);
      }
    };

    obtenerProductos();
  }, []); // El array vacío asegura que solo se ejecute una vez al montar

 
  // Escuchamos los cambios en el campo 'Menu'
  const selectedMenuId = useWatch({ control, name: "menu" });
  const selectedOpcionId = useWatch({ control, name: "opcion" });

  // Info a Selects de menú, se obtiene del backend al cargar la página, se guarda en el estado "data" y se muestra en el formulario
  useEffect(() => {
    fetchAllMenus().then((menus: MenuApiItem[]) => {
      const menuOptions = menus.map((menu) => ({
        value: menu.codigo,
        label: menu.descripcion,
      }));
      setMenus(menuOptions);
    });
  }, []);

  // 2. Cargar opciones cada vez que cambie el menú seleccionado
  useEffect(() => {
    // Si el usuario vuelve a poner la opción por defecto (vacía)
    if (!selectedMenuId) {
      setValue("opcion", ""); // Limpiamos el valor en el estado del formulario
      setValue("despliegue", "");
      return;
    }

    setValue("opcion", ""); // Reseteamos el select de opciones mientras carga
    setValue("despliegue", "");

    fetchOpciones(String(selectedMenuId))
      .then((data: OpcionApiItem[]) => {
        const opcionesData = data.map((opcion) => ({
          value: opcion.cod_opcion,
          label: opcion.descrip_opcion,
          despliegue: opcion.despliegue ?? opcion.despliegue ?? "",
        }));
        setOpciones(opcionesData);
      })
      .catch((err) => {
        console.error("Error opciones:", err);
      });
  }, [selectedMenuId, setValue]);

  useEffect(() => {
    const opcionSeleccionada = opciones.find(
      (item) => String(item.value) === String(selectedOpcionId),
    );

    setValue("despliegue", opcionSeleccionada?.despliegue ?? "", {
      shouldValidate: true,
    });
  }, [opciones, selectedOpcionId, setValue]);
