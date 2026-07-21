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
import "./index.css";
import SmellTest from "./pages/SmellTest";

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
        <Route path="/invest" element={<InvestmentRoadmap />} />
        <Route path="/invest/:id" element={<InvestmentDetail />} />
        <Route path="/payday" element={<IncomeEntryScreen />} />
        <Route path="/payday/split" element={<SplitScreen />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/scams" element={<ScamAwareness />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/smell-test" element={<SmellTest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
