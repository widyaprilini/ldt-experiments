import axios from "axios";

export async function saveLextaleResponse(payload) {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/lextale/response`, payload);
      return res.data;
    } catch (err) {
      console.error("API Error Submit LexTALE:", err);

        if (err.response) {
            throw new Error(err.response.data?.message || "Server error");
        } else if (err.request) {
            throw new Error("No response from server");
        } else {
            throw new Error(err.message);
        }
    }
  }