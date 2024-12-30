import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./views/layout";
import { Home } from "./views/Home";
// import { Admin } from "./views/Admin";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/admin" element={<Admin />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
