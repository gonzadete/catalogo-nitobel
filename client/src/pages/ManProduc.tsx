import { useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import type { z } from "zod";
import InputMask from "../components/ui/InputMask";
import { zodResolver } from "@hookform/resolvers/zod";
import { ValidationSchema } from "../components/ui/ValidationSchema";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Select, type SelectOption } from "../components/ui/Select";
import { createProducto, fetchAllMenus, fetchOpciones } from "../api";

type MenuApiItem = {
  codigo: string;
  descripcion: string;
};

type OpcionApiItem = {
  cod_opcion: string;
  descrip_opcion: string;
  despliegue?: string;
};

type OpcionSelectOption = SelectOption & {
  despliegue?: string;
};

type FormValues = z.infer<typeof ValidationSchema>;

const Manproduc = () => {
  const [menus, setMenus] = useState<SelectOption[]>([]);
  const [opciones, setOpciones] = useState<OpcionSelectOption[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(ValidationSchema),
    defaultValues: {
      codigo: "",
      descripcion: "",
      menu: "",
      opcion: "",
      despliegue: "",
      imagen_url: "",
      stock: "",
      precio: "",
    },
  });

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

  const onSubmit = async (data: FormValues) => { 
    try {
      const productoData = { ...data };
      delete productoData.despliegue;

      const payload = {
        ...productoData,
        stock: productoData.stock?.trim() ? Number(productoData.stock) : 0,
        precio: productoData.precio?.trim() ? Number(productoData.precio) : 0,
      };

      await createProducto(payload);
      reset();
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-500 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6 font-sans">
          Mantención de Productos
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          //   className="grid grid-cols-1 md:grid-cols-2 gap-5"
          className="grid grid-cols-6  md:grid-cols-2 gap-5"
        >
          {/* Código Producto Nitobel*/}
          <div className="flex flex-col col-span-2 xs:col-span-4 md:col-span-1 lg:col-span-1 gap-2">
            <Label htmlFor="codigo">Código del Producto</Label>

            <Controller
              name="codigo"
              control={control}
              render={({ field }) => (
                <InputMask
                  name={field.name}
                  value={field.value}
                  onChange={(event) =>
                    field.onChange({
                      ...event,
                      target: {
                        ...event.target,
                        value: event.target.value.toUpperCase(),
                      },
                    })
                  }
                  mask="AAA-000000000"
                  definitions={{ A: /[A-Za-z0-9]/ }}
                  placeholder="ABC-1234"
                  error={errors.codigo?.message}
                />
              )}
            />
          </div>

          {/* Descripción */}
          <div className="flex flex-col col-span-6  md:col-span-2 lg:col-span-2 gap-2">
            <Label htmlFor="descripcion">Descripción</Label>

            <Input
              type="text"
              error={errors.descripcion?.message}
              {...register("descripcion")}
              placeholder="Ej. Conector 12mm de alta calidad"
            />
          </div>

 
            {/* Menú*/}
            <div className="flex flex-col col-span-6 md:col-span-1 lg:col-span-1 gap-2">
              <Label htmlFor="menu">Opcion Menú</Label>

              <Select
                options={menus}
                error={errors.menu?.message}
                {...register("menu")}
              />
            </div>

            {/*Opcion SubMenú */}
            <div className="flex flex-col col-span-6 md:col-span-1 lg:col-span-1 gap-2">
              <Label htmlFor="opcion">Opción Sub-menú</Label>

              <Select
                options={opciones}
                disabled={!selectedMenuId}
                error={errors.opcion?.message}
                {...register("opcion")}
              />
            </div>


          {/* Stock */}
          <div className="flex flex-col col-span-6 md:col-span-1 lg:col-span-1 gap-2">
            <Label htmlFor="stock">Stock</Label>

            <Input
              type="number"
              error={errors.stock?.message}
              {...register("stock")}
              placeholder="Ej. 1200"
            />
          </div>

          {/* Precio Venta */}
          <div className="flex flex-col col-span-6 md:col-span-1 lg:col-span-1 gap-2">
            <Label htmlFor="precioVenta">Precio Venta</Label>

            <Input
              type="number"
              error={errors.precio?.message}
              {...register("precio")}
              placeholder="Ej. 1500"
            />
          </div>

          {/* imagel_url */}
          <div className="flex flex-col col-span-6 md:col-span-2 lg:col-span-2 gap-2">
            <Label htmlFor="imagen_url">URL de foto del Producto</Label>
            <Input
              type="text"
              error={errors.imagen_url?.message}
              {...register("imagen_url")}
              placeholder="Ej. https://example.com/imagen.jpg"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col col-span-6 md:col-span-2 lg:col-span-2">
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border hover:border-blue-600 transition-all duration-300"
            >
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Manproduc;
