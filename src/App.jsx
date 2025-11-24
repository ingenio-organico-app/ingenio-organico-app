import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Store />} />
      </Routes>
    </Router>
  );
}

