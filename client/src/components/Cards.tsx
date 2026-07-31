import { useMemo, useState } from "react";

export default function Cards({ productos }) {
    const [query, setQuery] = useState("");
    // const [onlyInStock, setOnlyInStock] = useState(false);

    const filteredProducts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return productos.filter((producto) => {
            const matchesQuery =
                !normalizedQuery ||
                producto.codigo?.toLowerCase().includes(normalizedQuery) ||
                producto.descripcion?.toLowerCase().includes(normalizedQuery);

            // const matchesStock = !onlyInStock || Number(producto.stock) > 0;

            return matchesQuery; // && matchesStock;
        });
    }, [productos, query]); // , onlyInStock]);
    const resolveImageUrl = (imagenUrl) => {
        if (!imagenUrl) {
            return "";
        }

        if (imagenUrl.startsWith("http://") || imagenUrl.startsWith("https://")) {
            return imagenUrl;
        }

        if (imagenUrl.startsWith("file:///") || imagenUrl.includes(":\\")) {
            return `${import.meta.env.VITE_API_URL}/local-image?path=${encodeURIComponent(imagenUrl)}`;
        }

        return imagenUrl;
    };

    return (
        <section>
            <div className="mt-12 mb-4 flex flex-wrap items-center justify-between gap-3">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Buscar por codigo o descripcion"
                    className="w-full max-w-105 rounded-[10px] border border-white/16 bg-white px-3 py-[0.55rem] text-zinc-600 placeholder:text-zinc-700"
                />

                {/* <label className="inline-flex items-center gap-2 text-[0.9rem] text-zinc-300">
                    <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(event) => setOnlyInStock(event.target.checked)}
                    />
                    Solo con stock
                </label> */}
            </div>

            {filteredProducts.length === 0 ? (
                <p className="text-gray-800 text-left">No hay productos con esos filtros.</p>
            ) : (
                <section className="grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
                    {filteredProducts.map((producto) => (
                        <article className="overflow-hidden rounded-[14px] border-4 border-white/12 bg-zinc-200 text-left" key={producto.codigo}>
                            <img
                                src={resolveImageUrl(producto.imagen_url)}
                                alt={producto.descripcion}
                                className="mb-2 block h-75 w-full rounded-xl bg-[#ffffff] object-contain"
                                loading="lazy"
                            />
                            <div className="p-[0.8rem]">
                                <p className="m-0 text-[0.8rem] font-bold text-red-800">Codigo: {producto.codigo}</p>
                                <h3 className="my-[0.35rem] text-base text-black">{producto.descripcion}</h3>
                                {/* <p className="product-meta">Menu: {producto.menu_descripcion ?? producto.menu}</p>
                                <p className="product-meta">Opcion: {producto.opcion_descripcion ?? producto.opcion}</p>
                                <p className="product-meta">Stock: {producto.stock}</p>
                                <p className="product-meta">Precio: {producto.precio}</p> */}
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </section>
    );
}