import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { createPaymentIntent } from "../services/paymentService";
import { createOrder } from "../services/orderService";

const CheckoutPage = ({ navigate }) => {
  const { user } = useAuth();
  const { cartItems, totalPrice, clearCartItems } = useCart();
  const toast = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(1);

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || user?.fullName || "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: ""
  });

  const [clientSecret, setClientSecret] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!shippingData.fullName || !shippingData.phone || !shippingData.address || !shippingData.city || !shippingData.country || !shippingData.postalCode) {
      toast("Please fill all shipping fields", "err");
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Step 1: Create order on backend
      const orderPayload = {
        cartItems: cartItems.map(item => ({
          productId: item.product?._id || item.product,
          qty: item.qty
        })),
        shippingAddress: {
          fullName: shippingData.fullName,
          line1: shippingData.address,
          line2: "",
          city: shippingData.city,
          state: "",
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          phone: shippingData.phone
        },
        notes: ""
      };

      const orderRes = await createOrder(orderPayload);
      const orderData = orderRes.order || orderRes;
      const orderId = orderData._id || orderData.id;
      setCurrentOrderId(orderId);

      // Step 2: Create payment intent for this order
      const paymentRes = await createPaymentIntent({ orderId });
      const secret = paymentRes.clientSecret || paymentRes.client_secret;
      setClientSecret(secret);

      if (!secret) {
        throw new Error("Failed to get payment client secret");
      }

      // Step 3: Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: shippingData.fullName }
        }
      });

      if (error) {
        setPaymentError(error.message);
        toast(error.message, "err");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        await clearCartItems();
        setOrderResult({
          orderId: orderData.orderId || orderId,
          itemsCount: cartItems.reduce((acc, curr) => acc + curr.qty, 0),
          totalAmount: totalPrice
        });
        setStep(3);
        toast("Order placed successfully!", "ok");
      }
    } catch (err) {
      toast(err.response?.data?.message || err.message || "Failed to process order", "err");
    } finally {
      setIsProcessing(false);
    }
  };

  const goBackToShipping = () => {
    setClientSecret(null);
    setStep(1);
    setPaymentError(null);
  };

  if (step < 3 && (!cartItems || cartItems.length === 0)) {
    return (
      <div style={{ padding: "140px 32px", textAlign: "center", background: "var(--void)", minHeight: "100vh" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 300, marginBottom: 16 }}>
          Your Cart is Empty
        </h2>
        <button style={{ padding: "12px 24px", background: "var(--gold)", color: "#000", border: "none", cursor: "pointer" }} onClick={() => navigate("/shop")}>
          Browse Collection
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "120px 20px 60px", maxWidth: 1000, margin: "0 auto", color: "var(--foreground)" }}>
      {/* Steps Indicator */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 40, gap: 40 }}>
        {[1, 2, 3].map((s) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: step >= s ? "var(--gold)" : "transparent",
              border: step >= s ? "none" : "1px solid var(--border)",
              color: step >= s ? "#000" : "var(--muted)",
              fontWeight: 600
            }}>
              {s}
            </div>
            <span style={{ color: step >= s ? "var(--gold)" : "var(--muted)", fontSize: 14 }}>
              {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Confirmation"}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 40, flexDirection: "row", flexWrap: "wrap" }}>
        
        {/* LEFT COLUMN - Forms */}
        <div style={{ flex: "1 1 500px" }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 20 }}>Shipping Information</h2>
              <form onSubmit={handleShippingSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input required placeholder="Full Name" value={shippingData.fullName} onChange={e => setShippingData({...shippingData, fullName: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                <input required placeholder="Phone Number" value={shippingData.phone} onChange={e => setShippingData({...shippingData, phone: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                <input required placeholder="Address Line" value={shippingData.address} onChange={e => setShippingData({...shippingData, address: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                <div style={{ display: "flex", gap: 16 }}>
                  <input required placeholder="City" value={shippingData.city} onChange={e => setShippingData({...shippingData, city: e.target.value})} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                  <input required placeholder="Postal Code" value={shippingData.postalCode} onChange={e => setShippingData({...shippingData, postalCode: e.target.value})} style={{ flex: 1, padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                </div>
                <input required placeholder="Country" value={shippingData.country} onChange={e => setShippingData({...shippingData, country: e.target.value})} style={{ padding: 12, background: "transparent", border: "1px solid var(--border)", color: "#fff" }} />
                
                <button type="submit" style={{ padding: 16, background: "var(--gold)", color: "#000", border: "none", marginTop: 10, cursor: "pointer", fontWeight: 600 }}>
                  Continue to Payment
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 20 }}>Payment details</h2>
              <div style={{ border: "1px solid var(--border)", padding: 20, marginBottom: 20, background: "rgba(255,255,255,0.02)" }}>
                <CardElement options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#e8e0d0",
                      "::placeholder": { color: "#6b6557" },
                    },
                    invalid: { color: "#c0392b" },
                  }
                }} />
              </div>
              
              {paymentError && <p style={{ color: "#c0392b", marginBottom: 16 }}>{paymentError}</p>}
              
              <div style={{ display: "flex", gap: 16 }}>
                <button onClick={goBackToShipping} disabled={isProcessing} style={{ padding: 16, flex: 1, background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", cursor: isProcessing ? "not-allowed" : "pointer" }}>
                  Back
                </button>
                <button onClick={handlePayment} disabled={isProcessing || cartItems.length === 0} style={{ padding: 16, flex: 2, background: "var(--gold)", color: "#000", border: "none", cursor: (isProcessing || cartItems.length === 0) ? "not-allowed" : "pointer", fontWeight: 600 }}>
                  {isProcessing ? "Processing..." : 'Pay $' + (totalPrice.toFixed(2))}
                </button>
              </div>
            </div>
          )}

          {step === 3 && orderResult && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gold)", color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 10 }}>Order placed successfully!</h2>
              <p style={{ color: "var(--muted)", marginBottom: 30 }}>Your order ID is: <strong style={{ color: "var(--foreground)" }}>{orderResult.orderId}</strong></p>
              
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 20, textAlign: "left", marginBottom: 30 }}>
                <p style={{ marginBottom: 10 }}><strong>Estimated delivery:</strong> {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ${orderResult.totalAmount.toFixed(2)}</p>
              </div>

              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                <button onClick={() => navigate("/shop")} style={{ padding: "12px 24px", background: "transparent", color: "var(--gold)", border: "1px solid var(--gold)", cursor: "pointer" }}>Continue Shopping</button>
                <button onClick={() => navigate("/profile/orders")} style={{ padding: "12px 24px", background: "var(--gold)", color: "#000", border: "none", cursor: "pointer" }}>View My Orders</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - Order Summary */}
        {step < 3 && (
          <div style={{ flex: "1 1 300px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", padding: 24, height: "fit-content" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20, borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20, maxHeight: 300, overflowY: "auto" }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>{item.qty}x {item.product?.name || "Product"}</span>
                  <span>${((item.product?.price || item.price || 0) * (item.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 600, color: "var(--gold)" }}>
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutPage;
