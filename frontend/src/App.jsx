import useStore from "./store/useStore.js";
import { wrap } from "./lib/ui.js";

import GlobalStyles from "./styles/GlobalStyles.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import AuthForm from "./components/forms/AuthForm.jsx";

import HomePage from "./pages/HomePage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

// Picks which page to render based on the current route.
function CurrentPage({ store }) {
  switch (store.route.name) {
    case "product": return <ProductDetailPage key={store.route.id} store={store} />;
    case "cart": return <CartPage store={store} />;
    case "checkout": return <CheckoutPage store={store} />;
    case "orders": return <OrdersPage store={store} />;
    case "confirmation": return <ConfirmationPage store={store} />;
    case "admin": return <AdminPage store={store} />;
    case "home":
    default: return <HomePage store={store} />;
  }
}

export default function App() {
  const store = useStore();
  const { currentUser, isAdmin, toast, login, register, resendVerification, loading, isDark } = store;

  // Show a loading indicator while checking auth session
  if (loading) {
    return (
      <div className={`ec-root ${isDark ? "dark" : ""}`}>
        <GlobalStyles />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ textAlign: "center", color: "var(--ink-soft)" }}>
            <div style={{
              width: 40, height: 40, border: "3px solid var(--line)", borderTopColor: "var(--accent)",
              borderRadius: "50%", animation: "ecSpin 0.8s linear infinite", margin: "0 auto 16px",
            }} />
            <p style={{ fontSize: 14, fontWeight: 500 }}>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={`ec-root ${isDark ? "dark" : ""}`}>
        <GlobalStyles />
        <AuthForm onLogin={login} onRegister={register} onResendVerification={resendVerification} />
        <Toast toast={toast} />
      </div>
    );
  }

  return (
    <div className={`ec-root ${isDark ? "dark" : ""}`}>
      <GlobalStyles />
      <Header store={store} />

      <main className="ec-wrap" style={{ ...wrap(), paddingTop: 28, paddingBottom: 70 }}>
        <CurrentPage store={store} />
      </main>

      <Footer />

      {!isAdmin && <WhatsAppButton />}
      <Toast toast={toast} />
    </div>
  );
}
