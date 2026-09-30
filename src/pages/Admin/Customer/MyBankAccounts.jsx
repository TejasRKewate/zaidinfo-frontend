// import React, { useEffect, useState } from "react";
// import { getCustomerBankAccounts } from "../../../services/bankAccountService";
// import "./MyBankAccounts.css";

// const MyBankAccounts = ({ customerId }) => {
//   const [account, setAccount] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (customerId) {
//       loadAccount();
//     }
//   }, [customerId]);

//   const loadAccount = async () => {
//     try {
//       setLoading(true);

//       const res = await getCustomerBankAccounts(customerId);

//       console.log("Bank Details:", res);

//       if (res.success) {
//         setAccount(res.data);
//       }
//     } catch (error) {
//       console.error("Bank Account Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <h3>Loading bank account...</h3>;
//   }

//   return (
//     <div className="bank-account-container">
//       <h2>My Bank Account</h2>

//       {!account ? (
//         <p>No Bank Account Found</p>
//       ) : (
//         <div className="bank-card">
//           <h4>{account.bankName || "N/A"}</h4>

//           <p>
//             <strong>Account Holder:</strong>{" "}
//             {account.accountHolderName || "N/A"}
//           </p>

//           <p>
//             <strong>Account Number:</strong>{" "}
//             {account.accountNumber || "N/A"}
//           </p>

//           <p>
//             <strong>IFSC:</strong>{" "}
//             {account.ifscCode || "N/A"}
//           </p>

//           <p>
//             <strong>Branch:</strong>{" "}
//             {account.branchName || "N/A"}
//           </p>

//           <p>
//             <strong>Account Type:</strong>{" "}
//             {account.accountType || "N/A"}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };


// export default MyBankAccounts;

import React, { useEffect, useState } from "react";
import {
  getCustomerBankAccounts,
  updateCustomerBankDetails,
} from "../../../services/bankAccountService";
import "./MyBankAccounts.css";

const emptyForm = {
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  accountType: "",
};

const MyBankAccounts = ({ customerId }) => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customerId) {
      setAccount(null);
      setLoading(false);
      return;
    }

    loadAccount();
  }, [customerId]);

  const loadAccount = async () => {
    try {
      setLoading(true);

      const res = await getCustomerBankAccounts(customerId);
      console.log("Bank Details:", res);

      // Supports responses shaped as { success: true, data: ... },
      // { data: ... }, or a direct account object/array.
      const result = res?.data ?? res;
      const bankAccount = Array.isArray(result) ? result[0] : result;

      setAccount(bankAccount || null);
    } catch (err) {
      console.error("Bank Account Error:", err);
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setFormData({
      bankName: account?.bankName || "",
      accountHolderName: account?.accountHolderName || "",
      accountNumber: account?.accountNumber || "",
      ifscCode: account?.ifscCode || "",
      branchName: account?.branchName || "",
      accountType: account?.accountType || "",
    });

    setError("");
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await updateCustomerBankDetails(customerId, formData);
      console.log("Updated Bank Details:", res);

      if (res?.success === false) {
        throw new Error(res.message || "Unable to update bank details.");
      }

      // Reload from server in case the update response doesn't include the account.
      await loadAccount();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Update Bank Details Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update bank details."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h3 className="bank-loading">Loading bank account...</h3>;
  }

  if (!customerId) {
    return <p className="bank-message">Customer ID is missing.</p>;
  }

  return (
    <div className="bank-account-container">
      <div className="bank-account-heading">
        <div>
          <span className="bank-eyebrow">ACCOUNT SETTINGS</span>
          <h2>My Bank Account</h2>
        </div>

        <button
          className="bank-update-button"
          type="button"
          onClick={openModal}
        >
          {account ? "Update Details" : "Add Bank Details"}
        </button>
      </div>

      {!account ? (
        <div className="bank-empty-state">
          <h3>No Bank Account Found</h3>
          <p>Add your bank details to get started.</p>
        </div>
      ) : (
        <div className="bank-card">
          <div className="bank-card-header">
            <div className="bank-icon" aria-hidden="true">
              🏦
            </div>
            <div>
              <h3>{account.bankName || "Bank Account"}</h3>
              <span className="bank-account-type">
                {account.accountType || "Account"}
              </span>
            </div>
          </div>

          <div className="bank-details-grid">
            <div className="bank-detail">
              <span>Account Holder</span>
              <strong>{account.accountHolderName || "N/A"}</strong>
            </div>

            <div className="bank-detail">
              <span>Account Number</span>
              <strong>{account.accountNumber || "N/A"}</strong>
            </div>

            <div className="bank-detail">
              <span>IFSC</span>
              <strong>{account.ifscCode || "N/A"}</strong>
            </div>

            <div className="bank-detail">
              <span>Branch</span>
              <strong>{account.branchName || "N/A"}</strong>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div
          className="bank-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <section
            className="bank-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bank-modal-title"
          >
            <div className="bank-modal-header">
              <div>
                <span className="bank-eyebrow">ACCOUNT SETTINGS</span>
                <h2 id="bank-modal-title">
                  {account ? "Update Bank Details" : "Add Bank Details"}
                </h2>
              </div>

              <button
                className="bank-modal-close"
                type="button"
                aria-label="Close modal"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bank-form-grid">
                <label>
                  Bank Name
                  <input
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Account Holder Name
                  <input
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Account Number
                  <input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    inputMode="numeric"
                    required
                  />
                </label>

                <label>
                  IFSC Code
                  <input
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Branch
                  <input
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Account Type
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select account type</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                  </select>
                </label>
              </div>

              {error && (
                <p className="bank-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="bank-modal-actions">
                <button
                  className="bank-cancel-button"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="bank-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Details"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default MyBankAccounts;