import { s } from "./HomePage.styles.js";

const content = {
  about: {
    title: "About Us",
    body: (
      <>
        <p>Welcome to <strong>Lila & Co.</strong>, your ultimate destination for modern, minimalist fashion. Founded with the vision to provide high-quality clothing at accessible prices, we believe that style should be effortless and sustainable.</p>
        <p>Our pieces are designed for everyday comfort without compromising on elegance. We source the best materials and work closely with ethical manufacturers to bring you collections that stand the test of time.</p>
        <p>Thank you for choosing Lila & Co. We are thrilled to be part of your wardrobe journey.</p>
      </>
    )
  },
  contact: {
    title: "Contact Us",
    body: (
      <>
        <p>We're here to help! If you have any questions about your order, our products, or just want to say hello, feel free to reach out to us.</p>
        <ul>
          <li><strong>Email:</strong> support@lilaco.com</li>
          <li><strong>Phone/WhatsApp:</strong> +91 99999 99999</li>
          <li><strong>Working Hours:</strong> Monday - Saturday, 10:00 AM to 6:00 PM (IST)</li>
        </ul>
        <p>For order-related inquiries, please include your Order ID for faster resolution.</p>
      </>
    )
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <p>At Lila & Co., we respect your privacy and are committed to protecting your personal data.</p>
        <p><strong>Information Collection:</strong> We collect information you provide directly to us when you create an account, place an order, or contact customer support (e.g., name, email, shipping address).</p>
        <p><strong>Use of Information:</strong> Your data is used exclusively to process your orders, communicate with you, and improve our services. We do not sell your personal information to third parties.</p>
        <p><strong>Security:</strong> We implement standard security measures to protect against unauthorized access or alteration of your personal data.</p>
      </>
    )
  },
  returns: {
    title: "Return & Refund Policy",
    body: (
      <>
        <p>We want you to love what you ordered! If you're not completely satisfied, we're here to help.</p>
        <p><strong>Returns:</strong> You can return unused items in their original condition and packaging within <strong>7 days</strong> of delivery.</p>
        <p><strong>Refunds:</strong> Once we receive and inspect your return, we will process your refund to the original payment method within 5-7 business days.</p>
        <p><strong>Exchanges:</strong> Need a different size? Contact our support team via WhatsApp, and we'll arrange an exchange for you.</p>
        <p><em>Please note that items bought during clearance sales are final and non-returnable.</em></p>
      </>
    )
  }
};

export default function InfoPage({ store }) {
  const { route, go } = store;
  // route.name should be one of: 'about', 'contact', 'privacy', 'returns'
  const pageData = content[route.name];

  if (!pageData) {
    return (
      <div className="ec-narrow-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Page Not Found</h2>
        <button className="ec-btn ec-btn-primary" style={{ marginTop: 20 }} onClick={() => go("home")}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="ec-narrow-page" style={{ padding: "40px 16px", maxWidth: 800, margin: "0 auto" }}>
      <h1 className="ec-disp" style={{ fontSize: 32, marginBottom: 24 }}>{pageData.title}</h1>
      <div className="ec-card" style={{ padding: 32, lineHeight: 1.6, fontSize: 16, color: "var(--ink-soft)" }}>
        {pageData.body}
      </div>
    </div>
  );
}
