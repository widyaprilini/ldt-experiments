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
    closeFullscreen();
  }, []);

  function enterFullscreen() {
    const el = document.documentElement;

    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  }

  async function closeFullscreen() {
    // if (document.exitFullscreen) {
    //   await document.exitFullscreen();
    if (document.webkitExitFullscreen) { 
      await document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { 
      await document.msExitFullscreen();
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.setItem("ldt_access", "true");
    localStorage.clear();
    enterFullscreen();
    navigate("/lextale", {
      state: { form, respondentId }
    });
  };

  return (
    <div className="container">
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-title">Participant Information</h2>

      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        autoComplete="off"
        />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={form.age}
        min="18"
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
    </div>
  );
}
