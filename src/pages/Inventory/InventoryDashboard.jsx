import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./InventoryDashboard.css";
import AddStockModal from "./AddStockModal";
import {
  getInventory,
  addStock,
  removeStock
} from "../../services/inventoryService";
import {
  getMyNotifications
} from "../../services/notificationService";
import { toast } from "react-toastify";

function InventoryDashboard() {
  const [searchParams] = useSearchParams();
  const notificationProductId = searchParams.get("product");

  // ==========================================
  // STATES
  // ==========================================
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [inventoryUnreadCount, setInventoryUnreadCount] = useState(0);

  // ==========================================
  // LOAD INVENTORY
  // ==========================================
  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    loadInventoryNotifications();
    const interval = setInterval(() => {
      loadInventoryNotifications();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const res = await getInventory();
      setInventory(res.data?.data || []);
    } catch (error) {
      console.log("INVENTORY ERROR:", error);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD INVENTORY NOTIFICATION COUNT
  // ==========================================
  const loadInventoryNotifications = async () => {
    try {
      const res = await getMyNotifications();
      const notifications = Array.isArray(res?.notifications)
        ? res.notifications
        : [];
      const inventoryNotifications = notifications.filter(
        (notification) =>
          notification.type === "STOCK_LOW" ||
          notification.type === "STOCK_OUT"
      );
      const unread = inventoryNotifications.filter(
        (notification) => !notification.isRead
      ).length;
      setInventoryUnreadCount(unread);
    } catch (error) {
      console.error("INVENTORY NOTIFICATION ERROR:", error);
    }
  };

  // ==========================================
  // OPEN ADD STOCK
  // ==========================================
  const openAddStock = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
  };

  // ==========================================
  // ADD STOCK
  // ==========================================
  const handleAddStock = async (productId, quantity) => {
    try {
      await addStock({
        productId,
        quantity: Number(quantity)
      });
      toast.success("Stock Added Successfully");
      setShowModal(false);
      await loadInventory();
      await loadInventoryNotifications();
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Failed to add stock"
      );
    }
  };

  // ==========================================
  // REMOVE STOCK
  // ==========================================
  const handleRemoveStock = async (productId) => {
    const qty = window.prompt("Enter quantity to remove");

    if (qty === null || qty === "") {
      return;
    }

    const quantity = Number(qty);

    if (!quantity || quantity <= 0) {
      toast.error("Enter valid quantity");
      return;
    }

    try {
      await removeStock({
        productId,
        quantity
      });
      toast.success("Stock Removed Successfully");
      await loadInventory();
      await loadInventoryNotifications();
    } catch (error) {
      console.log("REMOVE STOCK ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove stock"
      );
    }
  };

  // ==========================================
  // AVAILABLE STOCK & STATUS
  // ==========================================
  const getAvailableStock = (item) => {
    if (
      item.availableStock !== undefined &&
      item.availableStock !== null
    ) {
      return item.availableStock;
    }
    const current = Number(item.currentStock || 0);
    const reserved = Number(item.reservedStock || 0);
    return current - reserved;
  };

  const getStockStatus = (item) => {
    const currentStock = Number(item.currentStock || 0);
    const reservedStock = Number(item.reservedStock || 0);
    const availableStock = Math.max(currentStock - reservedStock, 0);

    if (availableStock === 0) return "OUT_OF_STOCK";
    if (availableStock >= 1 && availableStock <= 5) return "LOW_STOCK";
    return "IN_STOCK";
  };

  const totalProducts = inventory.length;

  const inStock = inventory.filter(
    (item) => getStockStatus(item) === "IN_STOCK"
  ).length;

  const lowStock = inventory.filter(
    (item) => getStockStatus(item) === "LOW_STOCK"
  ).length;

  const outOfStock = inventory.filter(
    (item) => getStockStatus(item) === "OUT_OF_STOCK"
  ).length;

  const totalStock = inventory.reduce(
    (total, item) => total + Number(item.currentStock || 0),
    0
  );

  // ==========================================
  // SEARCH + FILTER
  // ==========================================
  const filteredInventory = inventory.filter((item) => {
    const product = item.product;
    const matchNotificationProduct =
      !notificationProductId ||
      String(product?._id) === String(notificationProductId);

    if (!product) return false;

    const searchText = search.toLowerCase();
    const productName = (product.name || "").toLowerCase();
    const sku = (product.sku || "").toLowerCase();
    const brand = (product.brand?.name || "").toLowerCase();
    const category = (product.category?.name || "").toLowerCase();

    const matchSearch =
      productName.includes(searchText) ||
      sku.includes(searchText) ||
      brand.includes(searchText) ||
      category.includes(searchText);

    const matchStatus =
      statusFilter === "ALL" || getStockStatus(item) === statusFilter;

    return matchSearch && matchStatus && matchNotificationProduct;
  });

  // ==========================================
  // IMAGE URL
  // ==========================================
  const getImageUrl = (image) => {
    if (!image) return "";
    const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

    if (typeof image === "string") {
      if (image.startsWith("http")) return image;
      return `${BASE_URL}${image}`;
    }
    if (image.url) {
      if (image.url.startsWith("http")) return image.url;
      return `${BASE_URL}${image.url}`;
    }
    return "";
  };

  // ==========================================
  // STATUS TEXT
  // ==========================================
  const getStatusText = (status) => {
    switch (status) {
      case "IN_STOCK":
        return "In Stock";
      case "LOW_STOCK":
        return "Low Stock";
      case "OUT_OF_STOCK":
        return "Out Of Stock";
      default:
        return status || "-";
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="inventory-dashboard">
      <div className="inventory-page-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Manage products and stock</p>
        </div>
      </div>

      <div className="inventory-notification-badge">
        🔔
        {inventoryUnreadCount > 0 && <span>{inventoryUnreadCount}</span>}
      </div>

      {/* ==================================
          SUMMARY CARDS (5 SQUARE BOXES)
      ================================== */}
      <div className="inventory-cards">
        <div className="inventory-stat-card total">
          <div className="inventory-stat-top">
            <h3 className="inventory-stat-title">Total Products</h3>
            <div className="inventory-stat-icon">📦</div>
          </div>
          <div className="inventory-stat-body">
            <h2 className="inventory-stat-number">{totalProducts}</h2>
          </div>
        </div>

        <div className="inventory-stat-card stock">
          <div className="inventory-stat-top">
            <h3 className="inventory-stat-title">In Stock</h3>
            <div className="inventory-stat-icon">✅</div>
          </div>
          <div className="inventory-stat-body">
            <h2 className="inventory-stat-number">{inStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card low">
          <div className="inventory-stat-top">
            <h3 className="inventory-stat-title">Low Stock</h3>
            <div className="inventory-stat-icon">⚠️</div>
          </div>
          <div className="inventory-stat-body">
            <h2 className="inventory-stat-number">{lowStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card out">
          <div className="inventory-stat-top">
            <h3 className="inventory-stat-title">Out Of Stock</h3>
            <div className="inventory-stat-icon">❌</div>
          </div>
          <div className="inventory-stat-body">
            <h2 className="inventory-stat-number">{outOfStock}</h2>
          </div>
        </div>

        <div className="inventory-stat-card total-stock">
          <div className="inventory-stat-top">
            <h3 className="inventory-stat-title">Total Stock</h3>
            <div className="inventory-stat-icon">📊</div>
          </div>
          <div className="inventory-stat-body">
            <h2 className="inventory-stat-number">{totalStock}</h2>
          </div>
        </div>
      </div>

      {/* ==================================
          SEARCH + FILTER
      ================================== */}
      <div className="inventory-top">
        <input
          type="text"
          placeholder="Search product, SKU, brand, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW_STOCK">Low Stock</option>
          <option value="OUT_OF_STOCK">Out Of Stock</option>
        </select>
      </div>

      {/* ==================================
          TABLE
      ================================== */}
      {loading ? (
        <div className="inventory-loading">Loading inventory...</div>
      ) : (
        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Min</th>
                <th>Max</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item, index) => {
                  const product = item.product;
                  const stockStatus = getStockStatus(item);
                  const image =
                    product?.images?.length > 0
                      ? getImageUrl(product.images[0])
                      : "";

                  return (
                    <tr key={item._id}>
                      <td>{index + 1}</td>
                      <td>
                        {image ? (
                          <img
                            src={image}
                            alt={product?.name || "Product"}
                            className="inventory-image"
                          />
                        ) : (
                          <div className="inventory-no-image">No Image</div>
                        )}
                      </td>
                      <td>
                        <strong>{product?.name || "-"}</strong>
                      </td>
                      <td>{product?.sku || "-"}</td>
                      <td>{product?.brand?.name || "-"}</td>
                      <td>{product?.category?.name || "-"}</td>
                      <td>
                        ₹ {product?.pricing?.sellingPrice ?? 0}
                      </td>
                      <td>
                        <strong>{item.currentStock ?? 0}</strong>
                      </td>
                      <td>{item.reservedStock ?? 0}</td>
                      <td>
                        <strong>{getAvailableStock(item)}</strong>
                      </td>
                      <td>{item.minimumStock ?? 0}</td>
                      <td>{item.maximumStock ?? 0}</td>
                      <td>
                        <span
                          className={
                            stockStatus === "IN_STOCK"
                              ? "status in-stock"
                              : stockStatus === "LOW_STOCK"
                              ? "status low-stock"
                              : "status out-stock"
                          }
                        >
                          {getStatusText(stockStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="inventory-actions">
                          <button
                            className="add-btn"
                            onClick={() => openAddStock(item)}
                          >
                            + Stock
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemoveStock(product._id)}
                          >
                            - Stock
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="14" className="no-data">
                    No Product Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================
          ADD STOCK MODAL
      ================================== */}
      {showModal && selectedProduct && (
        <AddStockModal
          product={selectedProduct}
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
          onSave={handleAddStock}
        />
      )}
    </div>
  );
}

export default InventoryDashboard;