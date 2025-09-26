import React from 'react';

interface NavbarProps {
    userType: string;
    userName?: string;
}

const Navbar: React.FC<NavbarProps> = ({ userType, userName }) => {
    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const getNavItems = () => {
        switch (userType) {
            case 'PATIENT':
                return [
                    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
                    { name: 'Book Appointment', href: '/book-appointment', icon: '📅' },
                    { name: 'My Appointments', href: '/view-appointments', icon: '📋' },
                    { name: 'Medical Records', href: '/view-records', icon: '📄' },
                    { name: 'History', href: '/appointment-history', icon: '🕐' }
                ];
            case 'DOCTOR':
                return [
                    { name: 'Dashboard', href: '/doctor/dashboard', icon: '🏠' },
                    { name: 'Appointments', href: '/doctor/dashboard', icon: '📅' },
                    { name: 'Reschedule Requests', href: '/doctor/reschedule-requests', icon: '🔄' },
                    { name: 'Availability', href: '/doctor/availability', icon: '⏰' }
                ];

            default:
                return [];
        }
    };

    const getThemeColor = () => {
        switch (userType) {
            case 'PATIENT': return 'bg-blue-600';
            case 'DOCTOR': return 'bg-green-600';

            default: return 'bg-gray-600';
        }
    };

    return (
        <nav className={`${getThemeColor()} text-white shadow-lg`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold">MediCare</h1>
                        <span className="ml-3 px-2 py-1 bg-white bg-opacity-20 rounded text-sm">
                            {userType}
                        </span>
                    </div>
                    {/* ...existing code for nav items and logout... */}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
