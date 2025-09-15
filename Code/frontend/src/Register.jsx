import React, { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", form);
      setMsg("✅ Registration successful!");
      localStorage.setItem("token", res.data.token); // optional
    } catch (err) {
      setMsg("❌ " + (err.response?.data?.msg || "Error"));
    }
  };

  return (
    <div style={{ margin: "20px" }}>
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <input
        name="firstName"
        placeholder="First Name"
        value={form.firstName}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <input
        name="lastName"
        placeholder="Last Name"
        value={form.lastName}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <input
        name="phoneNumber"
        placeholder="Phone Number"
        value={form.phoneNumber}
        onChange={handleChange}
        style={{ padding: "8px", margin: "5px" }}
      /><br/>
      <button
        onClick={handleRegister}
        style={{
          padding: "8px 16px",
          borderRadius: "5px",
          border: "1px solid #333",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Register
      </button>
      <p>{msg}</p>
    </div>
  );
}

export default Register;
