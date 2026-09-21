import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

export const getItSupportProfile = async () => {
    const res = await axios.get(`${API_URL}/itsupport/profile`, getAuthHeaders());
    return res.data;
};

export const updateItSupportProfile = async (payload) => {
    const res = await axios.put(`${API_URL}/itsupport/profile`, payload, getAuthHeaders());
    return res.data;
};

export const changeItSupportPassword = async (payload) => {
    const res = await axios.put(`${API_URL}/itsupport/change-password`, payload, getAuthHeaders());
    return res.data;
};