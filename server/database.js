import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function getAllMenu() {
  const [rows] = await pool.query(`SELECT * FROM menu`);
  return rows;
}

export async function getMenu(id) {
  const [rows] = await pool.query(`SELECT * FROM menu WHERE id = ?`, [id]);
  return rows[0];
}

export async function getOpciones(id) {
  const [rows] = await pool.query(
    `SELECT * FROM opciones WHERE cod_menu = ? ORDER BY cod_opcion`,
    [id],
  );
  return rows;
}

export async function getAllProductos() {
  const [rows] = await pool.query(
    `
      SELECT
        p.id,
        p.codigo,
        p.descripcion,
        p.menu,
        p.opcion,
        p.imagen_url,
        p.stock,
        p.precio AS PRECIO
      FROM productos p
      ORDER BY p.codigo
    `,
  );

  return rows;
}

export async function getProductosByMenuOpcion(menu, opcion) {
  const [rows] = await pool.query(
    `
        SELECT
            p.id,
            p.codigo,
            p.descripcion,
            p.menu,
            p.opcion,
            p.imagen_url,
            p.stock,
            p.precio AS PRECIO,
            o.despliegue,
            m.descripcion AS menu_descripcion,
            o.descrip_opcion,
            o.url_imagen
        FROM productos p
        LEFT JOIN menu m ON m.codigo = p.menu
        LEFT JOIN opciones o ON o.cod_menu = p.menu AND o.cod_opcion = p.opcion
        WHERE p.menu = ? AND p.opcion = ?
        ORDER BY p.codigo
        `,
    [menu, opcion],
  );

  return rows;
}

export async function createProducto(producto) {
  const { codigo, descripcion, menu, opcion, imagen_url, stock, precio } =
    producto;

  const [result] = await pool.query(
    `
      INSERT INTO productos (codigo, descripcion, menu, opcion, imagen_url, stock, precio)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [codigo, descripcion, menu, opcion, imagen_url, stock, precio],
  );

  return {
    id: result.insertId,
    codigo,
    descripcion,
    menu,
    opcion,
    imagen_url,
    stock,
    precio,
  };
}

export async function updateProducto(id, producto) {
  const { codigo, descripcion, menu, opcion, imagen_url, stock, precio } =
    producto;

  const [result] = await pool.query(
    `
      UPDATE productos
      SET codigo = ?, descripcion = ?, menu = ?, opcion = ?, imagen_url = ?, stock = ?, precio = ?
      WHERE id = ?
    `,
    [codigo, descripcion, menu, opcion, imagen_url, stock, precio, id],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return {
    id,
    codigo,
    descripcion,
    menu,
    opcion,
    imagen_url,
    stock,
    precio,
  };
}

export async function deleteProducto(id) {
  const [result] = await pool.query(`DELETE FROM productos WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}
