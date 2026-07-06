import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import IncomeEntryScreen from './pages/payday/IncomeEntryScreen';
import SplitScreen from './pages/payday/SplitScreen';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/payday" replace />} />
        <Route path="/payday" element={<IncomeEntryScreen />} />
        <Route path="/payday/split" element={<SplitScreen />} />

        <Route path="*" element={<Navigate to="/payday" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
