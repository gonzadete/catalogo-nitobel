const ListaProduc = ({ selectedOption, productos }) => {
  return (
    <>
      {/* Muestra la imagen de la opción seleccionada */}
      {selectedOption?.url_imagen && (
        <div className="mb-4">
          <img
            src={selectedOption.url_imagen}
            alt={selectedOption.name}
            className="max-h-40 object-cover rounded"
          />
        </div>
      )}
      <hr className="my-3 border-t border-zinc-400/60" />
      <div className="overflow-x-auto rounded-lg border border-white/10 bg-[#e2e2ee]">
        <table className="w-full min-w-155 text-left text-sm text-zinc-200">
          <thead className="bg-zinc-400/40 text-zinc-800">
            <tr>
              <th className="px-4 py-3 font-semibold">Código</th>
              <th className="px-4 py-3 font-semibold">Descripción</th>
              {/* <th className="px-4 py-3 font-semibold">Stock</th>
					        <th className="px-4 py-3 font-semibold">Precio</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-400">
            {productos.map((producto) => (
              <tr key={producto.codigo} className="hover:bg-white/5">
                <td className="px-4 py-3 text-red-800 font-semibold">
                  {producto.codigo}
                </td>
                <td className="px-4 py-3 text-red-800 font-semibold">
                  {producto.descripcion}
                </td>
                {/* <td className="px-4 py-3">{producto.stock}</td>
                    <td className="px-4 py-3">{producto.precio}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ListaProduc;
