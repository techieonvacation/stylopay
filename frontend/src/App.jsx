import Navbar from "./components/ui/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Home from "./pages/Home";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Only show user navbar when NOT on admin routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default App;
