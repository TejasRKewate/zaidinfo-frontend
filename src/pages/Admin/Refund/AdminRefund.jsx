// import React, { useCallback, useEffect, useState } from "react";
// import {
//   getAllRefunds,
//   approveRefund,
//   rejectRefund,
//   processRefund,
// } from "../../../services/refundService";
// import "./AdminRefund.css";

// const getErrorMessage = (error) =>
//   error?.response?.data?.message ||
//   error?.message ||
//   "Something went wrong. Please try again.";

// const getId = (value) => {
//   if (!value) return "—";
//   if (typeof value === "object") return value._id || value.id || "—";
//   return String(value);
// };

// const formatCurrency = (amount) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(Number(amount) || 0);

// const formatDate = (date) => {
//   if (!date) return "—";
//   const parsedDate = new Date(date);
//   return Number.isNaN(parsedDate.getTime())
//     ? "—"
//     : parsedDate.toLocaleString("en-IN");
// };

// const AdminRefund = () => {
//   const [refunds, setRefunds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionId, setActionId] = useState("");
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");

//   const fetchRefunds = useCallback(async () => {
//     setError("");

//     try {
//       const response = await getAllRefunds();

//       // Supports either an Axios response or a fetch-style response object.
//       const payload = response?.data ?? response;
//       const list = Array.isArray(payload)
//         ? payload
//         : payload?.data?.refunds ??
//           payload?.refunds ??
//           payload?.data ??
//           [];

//       setRefunds(Array.isArray(list) ? list : []);
//     } catch (err) {
//       setError(getErrorMessage(err));
//       setRefunds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchRefunds();
//   }, [fetchRefunds]);

//   const runAction = async (refundId, action, successMessage) => {
//     setActionId(refundId);
//     setError("");
//     setNotice("");

//     try {
//       await action();
//       setNotice(successMessage);
//       await fetchRefunds();
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setActionId("");
//     }
//   };

//   const handleReject = (refundId) => {
//     const notes = window.prompt("Enter a reason or notes for rejecting this refund:");

//     if (notes === null) return;

//     runAction(
//       refundId,
//       () => rejectRefund(refundId, notes.trim()),
//       "Refund request rejected."
//     );
//   };

//   const handleApprove = (refundId) => {
//     runAction(
//       refundId,
//       () => approveRefund(refundId),
//       "Refund request approved."
//     );
//   };

//   const handleProcess = (refundId) => {
//     const confirmed = window.confirm(
//       "Process this approved refund? This action will update the payment and order."
//     );

//     if (!confirmed) return;

//     runAction(
//       refundId,
//       () => processRefund(refundId),
//       "Refund processed successfully."
//     );
//   };

//   const requestedCount = refunds.filter(
//     (refund) => refund.status === "REQUESTED"
//   ).length;

//   const approvedCount = refunds.filter(
//     (refund) => refund.status === "APPROVED"
//   ).length;

//   if (loading) {
//     return (
//       <main className="admin-refund-page">
//         <div className="refund-loading" role="status">
//           Loading refund requests…
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="admin-refund-page">
//       <header className="refund-page-header">
//         <div>
//           <p className="refund-eyebrow">Administration</p>
//           <h1>Refund Management</h1>
//           <p className="refund-page-description">
//             Review refund requests, approve or reject them, and process approved
//             refunds.
//           </p>
//         </div>

//         <button
//           className="refund-refresh-button"
//           type="button"
//           onClick={() => {
//             setLoading(true);
//             fetchRefunds();
//           }}
//           disabled={Boolean(actionId)}
//         >
//           Refresh
//         </button>
//       </header>

//       {error && (
//         <div className="refund-alert refund-alert-error" role="alert">
//           {error}
//         </div>
//       )}

//       {notice && (
//         <div className="refund-alert refund-alert-success" role="status">
//           {notice}
//         </div>
//       )}

//       <section className="refund-stats" aria-label="Refund summary">
//         <article className="refund-stat-card">
//           <span>Total requests</span>
//           <strong>{refunds.length}</strong>
//         </article>

//         <article className="refund-stat-card">
//           <span>Awaiting review</span>
//           <strong>{requestedCount}</strong>
//         </article>

//         <article className="refund-stat-card">
//           <span>Awaiting processing</span>
//           <strong>{approvedCount}</strong>
//         </article>
//       </section>

//       <section className="refund-table-card">
//         <div className="refund-table-heading">
//           <div>
//             <h2>Refund requests</h2>
//             <p>{refunds.length} request(s)</p>
//           </div>
//         </div>

//         {refunds.length === 0 ? (
//           <div className="refund-empty-state">
//             <h3>No refund requests found</h3>
//             <p>New refund requests will appear here.</p>
//           </div>
//         ) : (
//           <div className="refund-table-scroll">
//             <table className="refund-table">
//               <thead>
//                 <tr>
//                   <th>Refund</th>
//                   <th>Order</th>
//                   <th>Customer</th>
//                   <th>Amount</th>
//                   <th>Method</th>
//                   <th>Reason</th>
//                   <th>Requested</th>
//                   <th>Status</th>
//                   <th className="refund-actions-heading">Actions</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {refunds.map((refund) => {
//                   const refundId = getId(refund._id || refund.id);
//                   const orderId = getId(refund.order);
//                   const userId = getId(refund.user);
//                   const status = String(refund.status || "UNKNOWN").toUpperCase();
//                   const isBusy = actionId === refundId;

//                   return (
//                     <tr key={refundId}>
//                       <td data-label="Refund">
//                         <span className="refund-code">
//                           {refund.refundNumber || refundId.slice(-8)}
//                         </span>
//                       </td>

//                       <td data-label="Order">
//                         <span className="refund-code">{orderId.slice(-8)}</span>
//                       </td>

//                       <td data-label="Customer">
//                         <span className="refund-code">{userId.slice(-8)}</span>
//                       </td>

//                       <td data-label="Amount" className="refund-amount">
//                         {formatCurrency(refund.refundAmount)}
//                       </td>

//                       <td data-label="Method">
//                         {refund.refundMethod || "—"}
//                       </td>

//                       <td data-label="Reason" className="refund-reason">
//                         {refund.reason || refund.notes || "—"}
//                       </td>

//                       <td data-label="Requested">
//                         {formatDate(refund.requestedAt || refund.createdAt)}
//                       </td>

//                       <td data-label="Status">
//                         <span
//                           className={`refund-status refund-status-${status.toLowerCase()}`}
//                         >
//                           {status}
//                         </span>
//                       </td>

//                       <td data-label="Actions">
//                         <div className="refund-action-group">
//                           {status === "REQUESTED" && (
//                             <>
//                               <button
//                                 type="button"
//                                 className="refund-button refund-button-approve"
//                                 disabled={Boolean(actionId)}
//                                 onClick={() => handleApprove(refundId)}
//                               >
//                                 {isBusy ? "Working…" : "Approve"}
//                               </button>

//                               <button
//                                 type="button"
//                                 className="refund-button refund-button-reject"
//                                 disabled={Boolean(actionId)}
//                                 onClick={() => handleReject(refundId)}
//                               >
//                                 Reject
//                               </button>
//                             </>
//                           )}

//                           {status === "APPROVED" && (
//                             <button
//                               type="button"
//                               className="refund-button refund-button-process"
//                               disabled={Boolean(actionId)}
//                               onClick={() => handleProcess(refundId)}
//                             >
//                               {isBusy ? "Processing…" : "Process refund"}
//                             </button>
//                           )}

//                           {!["REQUESTED", "APPROVED"].includes(status) && (
//                             <span className="refund-no-action">No action</span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </main>
//   );
// };

// export default AdminRefund;


import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./AdminRefund.css";

const API_BASE_URL = "http://localhost:5000/api";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Something went wrong. Please try again.";

const getId = (value) => {
  if (!value) return "—";
  if (typeof value === "object") return value._id || value.id || "—";
  return String(value);
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : parsedDate.toLocaleString("en-IN");
};

const initialForm = {
  order: "",
  user: "",
  payment: "",
  returnRequest: "",
  refundAmount: "",
  refundMethod: "UPI",
  reason: "",
};

const AdminRefund = ({ activeReturnData = null }) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Pre-fill return response object data automatically
  useEffect(() => {
    if (activeReturnData && activeReturnData.status === "COMPLETED") {
      setForm((prevForm) => ({
        ...prevForm,
        order: getId(activeReturnData.order),
        user: getId(activeReturnData.user),
        returnRequest: getId(activeReturnData._id),
        reason: activeReturnData.customerNote || "Product Return Completed",
      }));
    }
  }, [activeReturnData]);

  // Direct HTTP Fetch All Refunds (localhost:5000/api/refunds)
  const fetchRefunds = useCallback(async () => {
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/refunds`);
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload?.data?.refunds ??
          payload?.refunds ??
          payload?.data ??
          [];

      setRefunds(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(getErrorMessage(err));
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRefunds();
  }, [fetchRefunds]);

  const runAction = async (actionFn, successMessage) => {
    setError("");
    setNotice("");

    try {
      await actionFn();
      setNotice(successMessage);
      await fetchRefunds();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId("");
    }
  };

  // Direct HTTP Create Refund POST request
  const handleCreateRefund = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setCreating(true);

    try {
      const bodyPayload = {
        order: form.order,
        user: form.user,
        returnRequest: form.returnRequest,
        refundAmount: Number(form.refundAmount),
        refundMethod: form.refundMethod,
        reason: form.reason,
      };

      if (form.payment) {
        bodyPayload.payment = form.payment;
      }

      await axios.post(`${API_BASE_URL}/refunds`, bodyPayload);

      setNotice("Refund request created successfully.");
      setForm(initialForm);
      await fetchRefunds();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  // Approve Refund Direct HTTP PUT
  const handleApprove = (refundId) => {
    setActionId(refundId);
    runAction(
      () => axios.put(`${API_BASE_URL}/refunds/${refundId}/approve`),
      "Refund request approved."
    );
  };

  // Reject Refund Direct HTTP PUT
  const handleReject = (refundId) => {
    const notes = window.prompt("Enter reason for rejection:");
    if (notes === null) return;

    setActionId(refundId);
    runAction(
      () =>
        axios.put(`${API_BASE_URL}/refunds/${refundId}/reject`, {
          adminNotes: notes.trim(),
        }),
      "Refund request rejected."
    );
  };

  // Process Refund Direct HTTP POST
  const handleProcess = (refundId) => {
    const confirmed = window.confirm("Process this refund payment now?");
    if (!confirmed) return;

    setActionId(refundId);
    runAction(
      () => axios.post(`${API_BASE_URL}/refunds/${refundId}/process`),
      "Refund processed successfully."
    );
  };

  const requestedCount = refunds.filter(
    (r) => r.status === "REQUESTED"
  ).length;
  const approvedCount = refunds.filter(
    (r) => r.status === "APPROVED"
  ).length;

  if (loading) {
    return (
      <main className="admin-refund-page">
        <div className="refund-loading">Loading refund requests…</div>
      </main>
    );
  }

  return (
    <main className="admin-refund-page">
      <header className="refund-page-header">
        <div>
          <p className="refund-eyebrow">Administration</p>
          <h1>Refund Management</h1>
          <p className="refund-page-description">
            Process customer return refunds via local API (`localhost:5000`)
          </p>
        </div>

        <button
          className="refund-refresh-button"
          type="button"
          onClick={() => {
            setLoading(true);
            fetchRefunds();
          }}
          disabled={Boolean(actionId) || creating}
        >
          Refresh
        </button>
      </header>

      {error && <div className="refund-alert refund-alert-error">{error}</div>}
      {notice && <div className="refund-alert refund-alert-success">{notice}</div>}

      {/* Form Section */}
      <section className="refund-table-card">
        <div className="refund-table-heading">
          <h2>Create Refund Request</h2>
        </div>

        <form className="refund-create-form" onSubmit={handleCreateRefund}>
          <label>
            Order ID
            <input
              required
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </label>

          <label>
            Customer ID
            <input
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
            />
          </label>

          <label>
            Return Request ID
            <input
              required
              value={form.returnRequest}
              onChange={(e) =>
                setForm({ ...form, returnRequest: e.target.value })
              }
            />
          </label>

          <label>
            Payment ID (Optional)
            <input
              value={form.payment}
              onChange={(e) => setForm({ ...form, payment: e.target.value })}
            />
          </label>

          <label>
            Refund Amount (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.refundAmount}
              onChange={(e) =>
                setForm({ ...form, refundAmount: e.target.value })
              }
            />
          </label>

          <label>
            Refund Method
            <select
              value={form.refundMethod}
              onChange={(e) =>
                setForm({ ...form, refundMethod: e.target.value })
              }
            >
              <option value="UPI">UPI</option>
              <option value="BANK">Bank Transfer</option>
              <option value="RAZORPAY">Razorpay</option>
              <option value="CASH">Cash</option>
            </select>
          </label>

          <label className="refund-create-reason">
            Reason
            <textarea
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>

          <button
            className="refund-button refund-button-approve"
            type="submit"
            disabled={creating || Boolean(actionId)}
          >
            {creating ? "Processing..." : "Create Refund"}
          </button>
        </form>
      </section>

      {/* Stats Cards */}
      <section className="refund-stats">
        <article className="refund-stat-card">
          <span>Total Requests</span>
          <strong>{refunds.length}</strong>
        </article>
        <article className="refund-stat-card">
          <span>Awaiting Review</span>
          <strong>{requestedCount}</strong>
        </article>
        <article className="refund-stat-card">
          <span>Awaiting Payment</span>
          <strong>{approvedCount}</strong>
        </article>
      </section>

      {/* Refunds Table */}
      <section className="refund-table-card">
        <div className="refund-table-heading">
          <h2>Refund Requests</h2>
        </div>

        {refunds.length === 0 ? (
          <div className="refund-empty-state">No refund requests found.</div>
        ) : (
          <div className="refund-table-scroll">
            <table className="refund-table">
              <thead>
                <tr>
                  <th>Refund No.</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund) => {
                  const refundId = getId(refund._id || refund.id);
                  const status = String(refund.status || "UNKNOWN").toUpperCase();
                  const isBusy = actionId === refundId;

                  return (
                    <tr key={refundId}>
                      <td>{refund.refundNumber || refundId.slice(-8)}</td>
                      <td>{getId(refund.order).slice(-8)}</td>
                      <td>{getId(refund.user).slice(-8)}</td>
                      <td>{formatCurrency(refund.refundAmount)}</td>
                      <td>{refund.refundMethod}</td>
                      <td>
                        <span className={`refund-status refund-status-${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="refund-action-group">
                          {status === "REQUESTED" && (
                            <>
                              <button
                                type="button"
                                className="refund-button refund-button-approve"
                                disabled={Boolean(actionId)}
                                onClick={() => handleApprove(refundId)}
                              >
                                {isBusy ? "..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                className="refund-button refund-button-reject"
                                disabled={Boolean(actionId)}
                                onClick={() => handleReject(refundId)}
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {status === "APPROVED" && (
                            <button
                              type="button"
                              className="refund-button refund-button-process"
                              disabled={Boolean(actionId)}
                              onClick={() => handleProcess(refundId)}
                            >
                              {isBusy ? "Processing..." : "Process Refund"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminRefund;