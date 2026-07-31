import express from "express";
import {
  getAllMenu,
  getMenu,
  getOpciones,
  deleteProducto,
  getAllProductos,
  getProductosByMenuOpcion,
  createProducto,
  updateProducto,
} from "./database.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const allowedOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"];

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

app.get("/local-image", (req, res) => {
  const { path: rawPath } = req.query;

  if (!rawPath || typeof rawPath !== "string") {
    return res.status(400).json({ error: "Debes enviar query param path" });
  }

  let localPath = rawPath;

  if (rawPath.startsWith("file:///")) {
    try {
      localPath = fileURLToPath(rawPath);
    } catch {
      return res.status(400).json({ error: "Ruta file:// invalida" });
    }
  }

  const resolvedPath = path.resolve(localPath);

  return res.sendFile(resolvedPath, (error) => {
    if (error) {
      if (!res.headersSent) {
        res
          .status(error.statusCode || 404)
          .json({ error: "No se pudo cargar la imagen local" });
      }
    }
  });
});

app.get("/menu", async (req, res) => {
  const menu = await getAllMenu();
  res.status(200).send(menu);
});

app.get("/menu/:id", async (req, res) => {
  const id = req.params.id;
  const menu = await getMenu(id);
  res.status(200).send(menu);
});

app.get("/opciones/:id", async (req, res) => {
  const id = req.params.id;
  const opciones = await getOpciones(id);
  res.status(200).send(opciones);
});

app.get("/productos", async (req, res) => {
  const { menu, opcion } = req.query;

  if (!menu || !opcion) {
    const productos = await getAllProductos();
    return res.status(200).json(productos);
  }

  const productos = await getProductosByMenuOpcion(menu, opcion);
  return res.status(200).json(productos);
});

const createProductoHandler = async (req, res) => {
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
};

const updateProductoHandler = async (req, res) => {
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
};

const deleteProductoHandler = async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "ID invalido" });
  }

  const eliminado = await deleteProducto(id);
  if (!eliminado) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  return res.status(204).send();
};

app.post("/productos", createProductoHandler);
app.post("/produc", createProductoHandler);
app.put("/productos/:id", updateProductoHandler);
app.delete("/productos/:id", deleteProductoHandler);

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
