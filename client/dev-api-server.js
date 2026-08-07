// Servidor local (solo para desarrollo) que expone las funciones de api/ via Express.
// En Vercel estas mismas funciones corren como serverless functions (ver api/index.js).
import "dotenv/config";
import app from "./api/index.js";

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`API local escuchando en http://localhost:${PORT}`);
});
