import axios from "axios";

export async function submitLdtResult(payload) {
    try {
        const res = await axios.post("/api/ldt/response", payload);
        return res.data;
    } catch (err) {
        console.error("API Error:", err);

        if (err.response) {
            throw new Error(err.response.data?.message || "Server error");
        } else if (err.request) {
            throw new Error("No response from server");
        } else {
            throw new Error(err.message);
        }
    }
}