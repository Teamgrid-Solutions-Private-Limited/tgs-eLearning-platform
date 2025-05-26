import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import { Box } from "@mui/material";
import Courses from "./pages/Courses";
import { SinglePageLayout } from "./components/SinglePageLayout";

// Wrapper component that conditionally renders Navbar
const AppContent = () => {
  const location = useLocation();
  const isEditorPage = location.pathname.includes("/course/edit/");

  return (
    <>
      {!isEditorPage && <Navbar />}
      <Routes>
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/edit/:id" element={<SinglePageLayout />} />
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<div>Library Page</div>} />
        <Route path="/organization" element={<div>Organization Page</div>} />
        <Route path="/learners" element={<div>Learners Page</div>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
