// import axios from "axios";

// const API = import.meta.env.VITE_API_URL;

// // Helper to get token
// const getAuthHeaders = () => {
//     const token = localStorage.getItem("token");
//     return {
//         headers: {
//             Authorization: `Bearer ${token}`,
//         },
//     };
// };

// // GET all bank accounts for a customer
// export const getCustomerBankAccounts = async (customerId) => {
//     const response = await axios.get(
//         `${API}/users/${customerId}/bank-accounts`, // Adjust route prefix if your route is mounted under /api/customers or /api/users
//         getAuthHeaders()
//     );
//     return response.data;
// };

// // GET a specific bank account by ID
// export const getCustomerBankAccountById = async (customerId, accountId) => {
//     const response = await axios.get(
//         `${API}/users/${customerId}/bank-accounts/${accountId}`,
//         getAuthHeaders()
//     );
//     return response.data;
// };

// export const updateCustomerBankDetails = async (customerId, bankDetails) => {
//     const response = await axios.patch(
//         `${API}/customer/${customerId}/bank-details`,
//         bankDetails,
//         getAuthHeaders()
//     );
//     return response.data;
// }


import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getCustomerBankAccounts = async (customerId) => {
    const response = await axios.get(
        `${API}/users/${customerId}/bank-accounts`,
        getAuthHeaders()
    );

    return response.data;
};

export const getCustomerBankAccountById = async (customerId, accountId) => {
    const response = await axios.get(
        `${API}/users/${customerId}/bank-accounts/${accountId}`,
        getAuthHeaders()
    );

    return response.data;
};

export const updateCustomerBankDetails = async (customerId, bankDetails) => {
    const response = await axios.patch(
        `${API}/users/customer/${customerId}/bank-details`,
        bankDetails,
        getAuthHeaders()
    );

    return response.data;
};
// export const updateCustomerBankDetails = async (customerId, bankDetails) => {
//     const response = await axios.put(
//         `${API}/users/${customerId}/bank-accounts`,
//         bankDetails,
//         getAuthHeaders()
//     );

//     return response.data;
// }