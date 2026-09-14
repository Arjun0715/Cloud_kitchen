import { Routes, Route, Link } from "react-router-dom";
import CustomerPage from "./components/CustomerPage.jsx";
import AdminPage from "./components/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route
        path="*"
        element={
          <div className="not-found">
            <p>That page doesn't exist.</p>
            <Link to="/">Back to the menu</Link>
          </div>
        }
      />
    </Routes>
  );
}
