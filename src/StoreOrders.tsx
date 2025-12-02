import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import "bootstrap/dist/css/bootstrap.min.css";

export default function StoreOrders() {
  const client = generateClient<Schema>();
  const [orders, setOrders] = useState<Schema["Order"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [activeOrder, setActiveOrder] = useState<
    Schema["Order"]["type"] | null
  >(null);

  const [orderItems, setOrderItems] = useState<Schema["OrderItem"]["type"][]>(
    [],
  );

  useEffect(() => {
    // 1️⃣ Initial load of Orders
    const fetchOrders = async () => {
      const res = await client.models.Order.list({});
      setOrders(res.data ?? []);
      setLoading(false);
    };

    fetchOrders();

    // 2️⃣ Subscribe to new Orders
    const sub = client.models.Order.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        setOrders(items); // real-time updates!
        // detect latest order
        if (isSynced && items.length > 0) {
          const latest = items[items.length - 1];
          // show modal only if the new order is not already processed
          if (latest.status === "Paid") {
            setActiveOrder(latest);
            setShowModal(true);
          }
        }
      },
      error: (err) => console.error("Order subscription error:", err),
    });

    return () => sub.unsubscribe();
  }, []);

  async function openModal(order: Schema["Order"]["type"]) {
    setActiveOrder(order);
    setShowModal(true);
    try {
      const itemRes = await client.models.OrderItem.list({
        filter: { orderID: { eq: order.id } },
      });
      console.log("Loaded order items:", itemRes);
      const consolidatedItems = consolidate(itemRes.data ?? []);
      setOrderItems(consolidatedItems ?? []);
    } catch (err) {
      console.log("Failed to load order items:", err);
    }
  }

  function consolidate(items: any[]) {
    const map = new Map();

    items.forEach((item) => {
      if (map.has(item.productID)) {
        map.get(item.productID).quantity += item.quantity;
      } else {
        map.set(item.productID, { ...item });
      }
    });
    return Array.from(map.values());
  }

  async function updateOrderStatus(status: string) {
    if (!activeOrder) return;
    try {
      await client.models.Order.update(
        { id: activeOrder.id, status },
        { authMode: "userPool" },
      );
      setShowModal(false);
      setActiveOrder(null);
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  }
  if (loading) return <div className="p-4">Loading Orders...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Store Orders</h2>

      {/* 🔔 Show modal for confirmation */}
      {activeOrder && (
        <div
          className={`modal fade ${showModal ? "show d-block" : ""}`}
          tabIndex={-1}
        >
          <div className="modal-dialog  modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Order Received</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>Order ID:</strong> {activeOrder.orderNumber ?? "N/A"}
                </p>
                <p>
                  <strong>Total:</strong> ${activeOrder.totalAmount ?? 0}
                </p>
                <p>
                  <strong>Status:</strong> {activeOrder.status}
                </p>
                <hr />
                <h6>Order Items</h6>

                {orderItems.length === 0 ? (
                  <p>No items found for this order.</p>
                ) : (
                  <table className="table table-sm table-bordered mt-2">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.productName ?? item.productID}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price?.toFixed(2) ?? "0.00"}</td>
                          <td>
                            $
                            {((item.quantity ?? 1) * (item.price ?? 0)).toFixed(
                              2,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <p>Do you want to confirm this order?</p>
              </div>

              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-danger"
                  onClick={() => updateOrderStatus("Cancelled")}
                >
                  Cancel Order
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => updateOrderStatus("Preparing")}
                >
                  Prepare Order
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => updateOrderStatus("Pickup")}
                >
                  Ready for Pickup
                </button>

                <button
                  className="btn btn-success"
                  onClick={() => updateOrderStatus("Confirmed")}
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <table className="table table-striped table-bordered table-hover mt-3">
        <thead className="table-dark">
          <tr>
            <th>Order ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th> {/* NEW COLUMN */}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>${o.totalAmount ?? 0}</td>
              <td>{o.status ?? "PENDING"}</td>
              <td>
                {o.createdAt ? new Date(o.createdAt).toLocaleString() : "N/A"}
              </td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => openModal(o)}
                >
                  Update Order
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
