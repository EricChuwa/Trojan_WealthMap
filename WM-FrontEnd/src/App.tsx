import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HealthHistory from "./pages/HealthHistory";
import Budget from "./pages/Budget";
import InvestmentRoadmap from "./pages/InvestmentRoadmap";
import InvestmentDetail from "./pages/InvestmentDetail";
import IncomeEntryScreen from "./pages/IncomeEntryScreen";
import SplitScreen from "./pages/SplitScreen";
import Learn from "./pages/Learn";
import ScamAwareness from "./pages/ScamAwareness";
import Goals from "./pages/Goals";
import SmellTest from "./pages/SmellTest";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health-history"
          element={
            <ProtectedRoute>
              <HealthHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/budget"
          element={
            <ProtectedRoute>
              <Budget />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invest"
          element={
            <ProtectedRoute>
              <InvestmentRoadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invest/:id"
          element={
            <ProtectedRoute>
              <InvestmentDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payday"
          element={
            <ProtectedRoute>
              <IncomeEntryScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payday/split"
          element={
            <ProtectedRoute>
              <SplitScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route path="/scams" element={<ScamAwareness />} />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route path="/smell-test" element={<SmellTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;