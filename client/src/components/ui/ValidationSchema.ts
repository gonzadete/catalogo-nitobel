import { z } from "zod";

export const ValidationSchema = z.object({
  codigo: z
    .string({
      error: "El código es requerido",
    })
    // .min(3, {
    //   message: "El código debe tener a lo menos 3 caracteres",
    // })
    .max(25, {
      message: "El código no puede tener más de 25 caracteres",
    }),

  descripcion: z
    .string({
      error: "La descripción es requerida",
    })
    .min(2, {
      message: "La descripción debe tener al menos 2 caracteres",
    })
    .max(50, {
      message: "La descripción no puede tener más de 50 caracteres",
    }),

  menu: z
    .string({
      error: "El menú es requerido",
    })
    .min(1, {
      message: "Debes seleccionar una opción de menú",
    }),

  opcion: z
    .string({
      error: "La opción es requerida",
    })
    .min(1, {
      message: "Debes seleccionar una opción de sub-menú",
    }),

  despliegue: z.string().optional(),

  imagen_url: z
    .string()
    .optional(),

  stock: z
    .string()
    .optional(),

  precio: z
    .string()
    .optional(),
    
}).superRefine((data, ctx) => {
  const esLista = (data.despliegue ?? "").toUpperCase() === "L";
  const imagenVacia = !data.imagen_url || data.imagen_url.trim().length === 0;

  // Si la opción no es de tipo lista, se exige imagen_url.
  if (!esLista && imagenVacia) {
    ctx.addIssue({
      path: ["imagen_url"],
      code: z.ZodIssueCode.custom,
      message: "La URL de la imagen es requerida",
    });
  }
});
