import { useEffect, useState } from "react";
import { api } from "../api.js";
import AdminOrders from "./AdminOrders.jsx";
import AdminMenu from "./AdminMenu.jsx";

const STORAGE_KEY = "cloudKitchenAdminPassword";

export default function AdminPage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [verified, setVerified] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (!password) return;
    api
      .getOrders(password)
      .then(() => setVerified(true))
      .catch(() => {
        setVerified(false);
        sessionStorage.removeItem(STORAGE_KEY);
      });
  }, [password]);

  function handleLogin(e) {
    e.preventDefault();
    const entered = new FormData(e.target).get("password");
    setLoginError(null);
    api
      .getOrders(entered)
      .then(() => {
        sessionStorage.setItem(STORAGE_KEY, entered);
        setPassword(entered);
        setVerified(true);
      })
      .catch(() => setLoginError("That password didn't work."));
  }

  if (!verified) {
    return (
      <main className="page admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <h1>Kitchen admin</h1>
          <label>
            Admin password
            <input name="password" type="password" required autoFocus />
          </label>
          {loginError && <p className="error-banner">{loginError}</p>}
          <button className="btn-primary" type="submit">
            Sign in
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="page admin-page">
      <header className="admin-header">
        <h1>Kitchen admin</h1>
        <nav className="admin-tabs">
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            Orders
          </button>
          <button className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>
            Menu
          </button>
        </nav>
      </header>
      {tab === "orders" ? <AdminOrders password={password} /> : <AdminMenu password={password} />}
    </main>
  );
}
