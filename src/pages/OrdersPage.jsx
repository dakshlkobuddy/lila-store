import OrderCard from "../components/OrderCard.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./OrdersPage.styles.js";

export default function OrdersPage({ store }) {
  const { orders, currentUser, go } = store;
  const mine = orders.filter((o) => o.userId === currentUser?.id);

  return (
    <div style={s.page}>
      <h1 className="ec-disp" style={s.heading}>My orders</h1>
      {mine.length === 0
        ? <Empty msg="You haven't placed any orders yet." action={<button className="ec-btn ec-btn-primary" onClick={() => go("home")}>Start shopping</button>} />
        : mine.map((o) => <OrderCard key={o.id} o={o} />)}
    </div>
  );
}
