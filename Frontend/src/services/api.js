import axios from "axios";

const API_BASE = "http://localhost:8000";

export const recognizeSign = async (frameData) => {
    const response = await axios.post(`${API_BASE}/sign/recognize`, { frame: frameData });
    return response.data;
};

export const sendResponse = async (text) => {
    const response = await axios.post(`${API_BASE}/sign/visualize`, { text });
    return response.data;
};
