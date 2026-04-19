import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useSubmissionId } from "../../hooks/useSubmissionId";
import "./identityForm.css";

export default function IdentityForm() {
  const navigate = useNavigate();
  const respondentId = useSubmissionId();
  
  const [form, setForm] = useState({
    name: "",
    gender: ""
  });

  useEffect(() => {
    sessionStorage.removeItem("ldt_access");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("ldt_access", "true");
    navigate("/ldt-experiment", {
      state: { form, respondentId }
    });
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-title">Participant Information</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={form.age}
        max="99"
        onChange={handleChange}
        required
      />
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        required
      >
        <option value="" disabled>-- Select Gender --</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
      </select>
      <button type="submit">Start</button>
    </form>
  );
}
