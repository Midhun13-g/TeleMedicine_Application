import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <header>
            <h1>Telemedicine App</h1>
            <button onClick={handleLogout}>Logout</button>
            <Link to="/book-appointment"><button>Book Appointment</button></Link>
        </header>
    );
};

export default Header;
