// import api from "../api/axios.js";

// export const createReturn = (data) =>
//     api.post("/returns", data);

// export const getMyReturns = () =>
//     api.get("/returns/my");

// export const getReturnById = (id) =>
//     api.get(`/returns/${id}`);

// export const getReturnsByOrder = (orderId) =>
//     api.get(`/returns/order/${orderId}`);

// export const getAllReturns = () =>
//     api.get("/returns");

// export const approveReturn = (id) =>
//     api.patch(`/returns/${id}/approve`);

// export const rejectReturn = (id, rejectionReason) =>
//     api.patch(`/returns/${id}/reject`, {
//         rejectionReason,
//     });

// export const requestPickup = (id) =>
//     api.patch(`/returns/${id}/pickup-request`);

// export const markPickedUp = (id, trackingNumber) =>
//     api.patch(`/returns/${id}/picked-up`, {
//         trackingNumber,
//     });

// export const receiveReturn = (id) =>
//     api.patch(`/returns/${id}/receive`);

// export const inspectReturn = (id, items) =>
//     api.patch(`/returns/${id}/inspect`, {
//         items,
//     });

// export const completeReturn = (id) =>
//     api.patch(`/returns/${id}/complete`);

// export const cancelReturn = (id) =>
//     api.patch(`/returns/${id}/cancel`);


import api from "../api/axios.js";

// Helper function: LocalStorage ke har possible naam se token nikalne ke liye
const getAuthHeaders = () => {
    let token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt");

    if (!token) {
        const userInfo =
            localStorage.getItem("userInfo") ||
            localStorage.getItem("user") ||
            localStorage.getItem("authUser");

        if (userInfo) {
            try {
                const parsed = JSON.parse(userInfo);
                token = parsed?.token || parsed?.accessToken || parsed?.jwt;
            } catch (e) {
                // ignore JSON parse error
            }
        }
    }

    if (token) {
        const cleanToken = token.replace(/^"(.*)"$/, "$1").trim();
        return {
            headers: {
                Authorization: `Bearer ${cleanToken}`
            }
        };
    }

    return {};
};

export const createReturn = (data) =>
    api.post("/returns", data, getAuthHeaders());

export const getMyReturns = () =>
    api.get("/returns/my", getAuthHeaders());

export const getReturnById = (id) =>
    api.get(`/returns/${id}`, getAuthHeaders());

export const getReturnsByOrder = (orderId) =>
    api.get(`/returns/order/${orderId}`, getAuthHeaders());

export const getAllReturns = () =>
    api.get("/returns", getAuthHeaders());

export const approveReturn = (id) =>
    api.patch(`/returns/${id}/approve`, {}, getAuthHeaders());

export const rejectReturn = (id, rejectionReason) =>
    api.patch(`/returns/${id}/reject`, { rejectionReason }, getAuthHeaders());

export const requestPickup = (id) =>
    api.patch(`/returns/${id}/pickup-request`, {}, getAuthHeaders());

export const markPickedUp = (id, trackingNumber) =>
    api.patch(`/returns/${id}/picked-up`, { trackingNumber }, getAuthHeaders());

export const receiveReturn = (id) =>
    api.patch(`/returns/${id}/receive`, {}, getAuthHeaders());

export const inspectReturn = (id, items) =>
    api.patch(`/returns/${id}/inspect`, { items }, getAuthHeaders());

export const completeReturn = (id) =>
    api.patch(`/returns/${id}/complete`, {}, getAuthHeaders());

export const cancelReturn = (id) =>
    api.patch(`/returns/${id}/cancel`, {}, getAuthHeaders());