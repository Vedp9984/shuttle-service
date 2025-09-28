import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import CreateAccountUser from "./CreateAccountUser";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<CreateAccountUser />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;