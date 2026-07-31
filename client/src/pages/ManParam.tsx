import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ManParam = () => {
  const formSchema = z.object({
    firstName: z
      .string({
        error: "El nombre es requerido",
      })
      .min(2, {
        message: "El nombre debe tener al menos 2 caracteres",
      })
      .max(20, {
        message: "El nombre no puede tener más de 20 caracteres",
      }),

    lastName: z
      .string({
        error: "El apellido es requerido",
      })
      .min(2, {
        message: "El apellido debe tener al menos 2 caracteres",
      })
      .max(20, {
        message: "El apellido no puede tener más de 20 caracteres",
      }),

    phone: z.string().optional(),

    email: z
      .string({
        error: "El correo es requerido",
      })
      .email({
        message: "El correo no es válido",
      }),
    // z.email({ pattern: z.regexes.email });

    company: z
      .string({
        error: "La empresa es requerida",
      })
      .min(2, {
        message: "La empresa debe tener al menos 2 caracteres",
      })
      .max(50, {
        message: "La empresa no puede tener más de 50 caracteres",
      }),

    queryType: z.string({
      error: "El tipo de consulta es requerido",
    }),

    message: z
      .string({
        error: "El mensaje es requerido",
      })
      .min(10, {
        message: "El mensaje debe tener al menos 10 caracteres",
      })
      .max(500, {
        message: "El mensaje no puede tener más de 500 caracteres",
      }),

    privacyPolicy: z.boolean({
      error: "Debe aceptar la política de privacidad",
    }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queryType: "general",
      privacyPolicy: false,
    },
  });

  const onSubmit = (data: FieldValues) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-500 p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-6 font-sans">
          Mantención de Parámetros
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
     //   className="grid grid-cols-1 md:grid-cols-2 gap-5"
          className="grid grid-cols-4 md:grid-cols-2 gap-5"
        >
          {/* First Name */}
          <div className="flex flex-col col-span-4 xs:col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1 gap-2">
            <label htmlFor="firstName" className="text-slate-700 font-medium">
              Nombre
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              placeholder="Ej. Juan"
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400"
            />

            {errors.firstName && (
              <span className="text-red-500 text-sm">
                {errors.firstName.message}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col col-span-4 gap-2">
            <label htmlFor="lastName" className="text-slate-700 font-medium">
              Apellido
            </label>
            <input
              type="text"
              id="lastName"
              {...register("lastName")}
              placeholder="Ej. Pérez"
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400"
            />

            {errors.lastName && (
              <span className="text-red-500 text-sm">
                {errors.lastName.message}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col col-span-4 gap-2 md:col-span-1 xl:col-span-1">
            <label htmlFor="phone" className="text-slate-700 font-medium">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              {...register("phone")}
              placeholder="Ej. +34 600 123 456"
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col col-span-4 gap-2 md:col-span-3 xl:col-span-3">
            <label htmlFor="email" className="text-slate-700 font-medium">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              placeholder="Ej. ejemplo@correo.com"
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400"
            />

            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Company */}
          <div className="flex flex-col col-span-4 gap-2 md:col-span-4 xl:col-span-4">
            <label htmlFor="company" className="text-slate-700 font-medium">
              Empresa
            </label>
            <input
              type="text"
              id="company"
              {...register("company")}
              placeholder="Ej. Mi Empresa S.L."
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400"
            />

            {errors.company && (
              <span className="text-red-500 text-sm">
                {errors.company.message}
              </span>
            )}
          </div>

          {/* Query Type */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-slate-700 font-medium">
              Tipo de Consulta
            </label>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-400 rounded-md hover:border-blue-600 transition-colors cursor-pointer">
                <input
                  {...register("queryType")}
                  type="radio"
                  id="general"
                  value="general"
                  className="accent-blue-600"
                />
                <label
                  htmlFor="general"
                  className="text-slate-700 cursor-pointer"
                >
                  Consulta General
                </label>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border border-slate-400 rounded-md hover:border-blue-600 transition-colors cursor-pointer">
                <input
                  {...register("queryType")}
                  type="radio"
                  id="support"
                  value="support"
                  className="accent-blue-600"
                />
                <label
                  htmlFor="support"
                  className="text-slate-700 cursor-pointer"
                >
                  Consulta de Soporte
                </label>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 border border-slate-400 rounded-md hover:border-blue-600 transition-colors cursor-pointer">
                <input
                  {...register("queryType")}
                  type="radio"
                  id="sales"
                  value="sales"
                  className="accent-blue-600"
                />
                <label
                  htmlFor="sales"
                  className="text-slate-700 cursor-pointer"
                >
                  Consulta de Ventas
                </label>
              </div>

              {errors.queryType && (
                <span className="text-red-500 text-sm">
                  {errors.queryType.message}
                </span>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="message" className="text-slate-700 font-medium">
              Mensaje
            </label>
            <textarea
              id="message"
              {...register("message")}
              rows={6}
              placeholder="Ej. Me gustaría obtener más información sobre sus servicios."
              className="px-4 py-3 border border-slate-400 rounded-md focus:outline-none focus:border-blue-600 text-slate-700 placeholder-slate-400 resize-none"
            />

            {errors.message && (
              <span className="text-red-500 text-sm">
                {errors.message.message}
              </span>
            )}
          </div>

          {/* Privacy Policy */}
          <div className="flex items-center gap-3 md:col-span-1">
            <input
              type="checkbox"
              id="privacyPolicy"
              {...register("privacyPolicy")}
              className="w-5 h-5 accent-blue-600 rounded border border-slate-400"
            />
            <label
              htmlFor="privacyPolicy"
              className="text-slate-700 cursor-pointer"
            >
              Acepto la{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-50 hover:text-blue-600 hover:border hover:border-blue-600 transition-all duration-300"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ManParam;