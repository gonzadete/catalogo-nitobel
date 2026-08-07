import serverlessMysql from "serverless-mysql";
import mysql2 from "mysql2";

const useSsl =
  process.env.DB_HOST &&
  process.env.DB_HOST !== "127.0.0.1" &&
  process.env.DB_HOST !== "localhost";

const db = serverlessMysql({
  library: mysql2,
  config: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    // Aiven (y la mayoria de MySQL administrados) exigen TLS; localhost no lo necesita
    ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  },
});

export default db;
    