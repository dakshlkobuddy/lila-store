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
  const { currentUser, isAdmin, toast, login, register } = store;

  return (
    <div className="ec-root">
      <GlobalStyles />
      <Header store={store} />

      <main style={{ ...wrap(), paddingTop: 28, paddingBottom: 70 }}>
        {!currentUser
          ? <AuthForm onLogin={login} onRegister={register} />
          : <CurrentPage store={store} />}
      </main>

      <Footer />

      {currentUser && !isAdmin && <WhatsAppButton />}
      <Toast toast={toast} />
    </div>
  );
}
