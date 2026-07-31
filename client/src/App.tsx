import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Files from "./pages/Files";
import "./App.css";
// import ManProduc from "./pages/ManProduc";
//import ProductosTable from "./pages/ProductosTable";
import ManParam from "./pages/ManParam";
import SEO from "./components/ui/SEO";
import { GrillaProductos } from "./pages/GrillaProductos";
import { isAdminAuthenticated } from "./pages/auth";

const ProtectedRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <>
      <SEO
        title="Catálogo Nitobel"
        description="luces led, neumatica, conectores, valvulas, aire comprimido, espirales, mangueras, accesorios, herramientas, tecalan, union rapida, acoples, regulador presion, cilindros, lubricadores, accesorios aire comprimido"
        name="@nitobel"
        type="website"
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <Files />
              </ProtectedRoute>
            }
          />
          <Route
            path="/produc"
            element={
              <ProtectedRoute>
                <Files>
                  {" "}
                  {/* Aquí se renderiza el componente Files, que incluye la barra lateral y el espacio principal. Dentro del espacio principal, se renderiza el componente ManProduc, que es el contenido específico para la ruta "/produc".*/}
                  {/* <ManProduc /> */}
                  <GrillaProductos />
                </Files>
              </ProtectedRoute>
            }
          />
          <Route
            path="/param"
            element={
              <ProtectedRoute>
                <Files>
                  <ManParam />
                </Files>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
