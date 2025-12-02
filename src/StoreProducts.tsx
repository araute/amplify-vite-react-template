import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { StoreProductWithDetails } from "./types/StoreProductWithDetails.ts";

const client = generateClient<Schema>();

export default function StoreProductsPage() {
  const storeId = "5e434070-68e4-43e5-a609-fcedeebcc3a3"; // <-- /store-products/:storeId
  const [storeProducts, setStoreProducts] = useState<StoreProductWithDetails[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const saveQuantity = async (
    product: StoreProductWithDetails,
    index: number,
  ) => {
    try {
      setSavingIndex(index);

      // Update StoreProduct record
      await client.models.StoreProduct.update(
        {
          id: product.id, // identifies record
          productID: product.productID,
          quantity: product.quantity, // updated field
        },
        { authMode: "userPool" },
      );

      // Reset editing mode
      const updated = [...storeProducts];
      updated[index].isEditing = false;
      setStoreProducts(updated);

      setMessage(`Saved ${product.productName} successfully!`);
    } catch (err) {
      console.error("Save failed:", err);
      setMessage(`❌ Failed to save ${product.productName}`);
    } finally {
      setSavingIndex(null);
    }
  };

  async function getStoreProductsWithDetails() {
    let nextToken: string | null = null;
    let products: Schema["StoreProduct"]["type"][] = [];
    let result: Awaited<ReturnType<typeof client.models.StoreProduct.list>>;
    do {
      result = await client.models.StoreProduct.list({
        filter: { storeID: { eq: storeId } },
        limit: 100,
        nextToken,
      });
      products = [...products, ...result.data];
      nextToken = result.nextToken;
    } while (nextToken);

    const storeProductIds = [...new Set(products.map((p) => p.productID))];

    const productResults = await Promise.all(
      storeProductIds.map((id) =>
        client.models.Product.get({ id }, { authMode: "userPool" }),
      ),
    );
    const productMap = new Map(
      productResults
        .filter((p) => p.data) // ignore missing items
        .map((p) => [p.data!.id, p.data]),
    );

    console.log(productMap);

    return products.map((sp) => {
      const p = productMap.get(sp.productID);
      return {
        id: sp.id,
        productID: sp.productID,
        productName: p?.name,
        productPrice: p?.price,
        imageUrl: p?.imageUrl,
        quantity: sp.quantity ?? 0,
        priceOverride: sp.priceOverride,
        finalPrice: sp.priceOverride ?? p?.price,
        isAvailable: sp.isAvailable,
        isEditing: false,
      };
    });
  }

  useEffect(() => {
    if (!storeId) return; // no ID, nothing to load

    const loadStoreProducts = async () => {
      try {
        const loadedProducts = await getStoreProductsWithDetails();
        console.log("Loaded Products" + loadedProducts);
        setStoreProducts(loadedProducts);
      } catch (err) {
        console.error("❌ Failed to load store products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStoreProducts();
  }, [storeId]);

  if (loading)
    return <div style={{ padding: 20 }}>Loading store products...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Store Products</h2>
      <p className="text-muted">Store ID: {storeId}</p>

      {storeProducts.length === 0 ? (
        <p>No products found for this store.</p>
      ) : (
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Product Name</th>
              <th style={{ width: "120px" }}>Quantity</th>
              <th style={{ width: "200px" }} className="text-end">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {storeProducts.map((p, idx) => (
              <tr key={p.productID}>
                <td>{p.productName}</td>

                <td>
                  {p.isEditing ? (
                    <input
                      type="number"
                      className="form-control"
                      value={p.quantity}
                      onChange={(e) => {
                        const updated = [...storeProducts];
                        updated[idx].quantity = Number(e.target.value);
                        setStoreProducts(updated);
                      }}
                    />
                  ) : (
                    p.quantity
                  )}
                </td>

                <td className="text-end">
                  {!p.isEditing ? (
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => {
                        const updated = [...storeProducts];
                        updated[idx].isEditing = true;
                        setStoreProducts(updated);
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-success me-2"
                      disabled={savingIndex === idx}
                      onClick={() => saveQuantity(p, idx)}
                    >
                      {savingIndex === idx ? "Saving..." : "Save"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {message && (
        <div
          className="alert alert-info alert-dismissible fade show"
          role="alert"
        >
          {message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage(null)}
          ></button>
        </div>
      )}
    </div>
  );
}
