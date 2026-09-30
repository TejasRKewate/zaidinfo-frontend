// import api from "../api/axios.js";

// export const createRefund = (data) =>
//     api.post("/refunds", data);

// export const getAllRefunds = () =>
//     api.get("/refunds");

// export const getRefundById = (id) =>
//     api.get(`/refunds/${id}`);

// export const getOrderRefunds = (orderId) =>
//     api.get(`/refunds/order/${orderId}`);

// export const approveRefund = (id) =>
//     api.patch(`/refunds/${id}/approve`);

// export const rejectRefund = (id, notes) =>
//     api.patch(`/refunds/${id}/reject`, {
//         notes,
//     });

// export const processRefund = (id) =>
//     api.patch(`/refunds/${id}/process`);

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

const baseUrl = `${String(API_URL || "").replace(/\/+$/, "")}/refunds`;

export const getAllRefunds = () =>
    axios.get(baseUrl, getAuthConfig());

export const approveRefund = (refundId) =>
    axios.patch(
        `${baseUrl}/${refundId}/approve`,
        {},
        getAuthConfig()
    );

export const rejectRefund = (refundId, notes = "") =>
    axios.patch(
        `${baseUrl}/${refundId}/reject`,
        { notes },
        getAuthConfig()
    );

export const processRefund = (refundId) =>
    axios.patch(
        `${baseUrl}/${refundId}/process`,
        {},
        getAuthConfig()
    );

export const createRefund = (refundData) =>
    axios.post(`${baseUrl}`, refundData);