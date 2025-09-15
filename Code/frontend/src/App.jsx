import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import CreateAccountUser from "./CreateAccountUser";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<CreateAccountUser />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
export default App;
