import express from "express";
import cors from "cors";
import db from "./db.js";
import {
  getAllMenu,
  getMenu,
  getOpciones,
  getAllProductos,
  getProductosByMenuOpcion,
  createProducto,
  updateProducto,
  deleteProducto,
} from "./queries.js";

// Origenes fijos de desarrollo + los que se agreguen por variable de entorno
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL?.split(",").map((url) => url.trim()) ?? []),
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("No permitido por CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

// serverless-mysql necesita liberar la conexion al final de cada invocacion
function asyncRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    } finally {
      await db.end();
    }
  };
}

app.get(
  "/api/menu",
  asyncRoute(async (req, res) => {
    const menu = await getAllMenu();
    res.status(200).json(menu);
  }),
);

app.get(
  "/api/menu/:id",
  asyncRoute(async (req, res) => {
    const menu = await getMenu(req.params.id);
    res.status(200).json(menu);
  }),
);

app.get(
  "/api/opciones/:id",
  asyncRoute(async (req, res) => {
    const opciones = await getOpciones(req.params.id);
    res.status(200).json(opciones);
  }),
);

app.get(
  "/api/productos",
  asyncRoute(async (req, res) => {
    const { menu, opcion } = req.query;

    if (!menu || !opcion) {
      const productos = await getAllProductos();
      return res.status(200).json(productos);
    }

    const productos = await getProductosByMenuOpcion(menu, opcion);
    return res.status(200).json(productos);
  }),
);

const createProductoHandler = asyncRoute(async (req, res) => {
  const { codigo, descripcion, menu, opcion, imagen_url, stock, precio } =
    req.body ?? {};

  if (!codigo || !descripcion || !menu || !opcion) {
    return res.status(400).json({
      error: "Debes enviar codigo, descripcion, menu, opcion e imagen_url",
    });
  }

  const parsedStock = Number.parseInt(String(stock ?? "").trim(), 10);
  const parsedPrecio = Number.parseInt(String(precio ?? "").trim(), 10);

  const producto = await createProducto({
    codigo,
    descripcion,
    menu,
    opcion,
    imagen_url,
    stock: Number.isNaN(parsedStock) ? 0 : parsedStock,
    precio: Number.isNaN(parsedPrecio) ? 0 : parsedPrecio,
  });

  return res.status(201).json(producto);
});

const updateProductoHandler = asyncRoute(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  const { codigo, descripcion, menu, opcion, imagen_url, stock, precio } =
    req.body ?? {};

  if (!codigo || !descripcion || !menu || !opcion) {
    return res.status(400).json({
      error: "Debes enviar codigo, descripcion, menu, opcion e imagen_url",
    });
  }

  const parsedStock = Number.parseInt(String(stock ?? "").trim(), 10);
  const parsedPrecio = Number.parseInt(String(precio ?? "").trim(), 10);

  const producto = await updateProducto(id, {
    codigo,
    descripcion,
    menu,
    opcion,
    imagen_url,
    stock: Number.isNaN(parsedStock) ? 0 : parsedStock,
    precio: Number.isNaN(parsedPrecio) ? 0 : parsedPrecio,
  });

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  return res.status(200).json(producto);
});

const deleteProductoHandler = asyncRoute(async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  const eliminado = await deleteProducto(id);
  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  return res.status(204).send();
});

app.post("/api/productos", createProductoHandler);
app.put("/api/productos/:id", updateProductoHandler);
app.delete("/api/productos/:id", deleteProductoHandler);

// Vercel: exportar la app de Express directamente, sin app.listen()
export default app;
