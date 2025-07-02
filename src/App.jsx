import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home"
import Navbar from "./components/common/Navbar"

function App() {
    return (
        <div className="100vh 100vw min-h-screen bg-richblack-900 flex flex-col font-inter">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home/>} />
            </Routes>
        </div>
    );
}

export default App;
