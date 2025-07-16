import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Navbar from "./components/common/Navbar";
import OpenRoute from "./components/core/Auth/OpenRoute";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import Rateus from "./pages/Rateus";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Error from "./pages/Error";
import Project from "./pages/Project";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <div className="100vh 100vw min-h-screen bg-richblack-900 flex flex-col font-inter">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="login"
                    element={
                        <OpenRoute>
                            <Login />
                        </OpenRoute>
                    }
                />
                <Route
                    path="signup"
                    element={
                        <OpenRoute>
                            <Signup />
                        </OpenRoute>
                    }
                />
                <Route
                    path="forgot-password"
                    element={
                        <OpenRoute>
                            <ForgotPassword />
                        </OpenRoute>
                    }
                />
                <Route
                    path="verify-email"
                    element={
                        <OpenRoute>
                            <VerifyEmail />
                        </OpenRoute>
                    }
                />
                <Route
                    path="update-password/:id"
                    element={
                        <OpenRoute>
                            <UpdatePassword />
                        </OpenRoute>
                    }
                />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/project" element={<Project />} />
                <Route path="/rateus" element={<Rateus />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/termsandconditions" element={<TermsAndConditions />} />
                <Route
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                ></Route>
            </Routes>

            <Toaster
                position="top-center"
            />
        </div>
    );
}

export default App;
