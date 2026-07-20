import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HealthHistory from "./pages/HealthHistory";
import Budget from "./pages/Budget";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/health-history" element={<HealthHistory />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
