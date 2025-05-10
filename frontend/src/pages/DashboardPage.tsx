import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddressManager from '../components/address-manager';
import CreditCardManager from '../components/card-manager';
import PropertyManager from '../components/property-manager';
import PropertySearchGrid from '../components/property-search-grid';

interface User {
  user_id: number;
  is_agent: boolean;
}

interface DashboardPageProps {
  user: User | null;
}

export default function DashboardPage({ user }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setActiveTab(user.is_agent ? 'properties' : 'properties');
    }
  }, [user]);

  const renterTabs = [
    { key: 'properties', label: 'Available Properties' },
    { key: 'addresses', label: 'Addresses' },
    { key: 'payments', label: 'Payment Methods' },
  ];

  const agentTabs = [
    { key: 'properties', label: 'Available Properties' },
    { key: 'manage_properties', label: 'Manage Properties' },
    { key: 'bookings', label: 'View Bookings' },
  ];

  const tabs = user?.is_agent ? agentTabs : renterTabs;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`block w-full text-left p-2 rounded ${activeTab === tab.key ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {!user ? null : (
          <>
            {}
            {activeTab === 'properties' && <PropertySearchGrid userId={user.user_id} />}
            {!user.is_agent && activeTab === 'addresses' && <AddressManager userId={user.user_id} />}
            {!user.is_agent && activeTab === 'payments' && <CreditCardManager userId={user.user_id} />}
            {user.is_agent && activeTab === 'manage_properties' && <PropertyManager userId={user.user_id} />}
            {!user.is_agent && activeTab === 'bookings' && <div>Property management UI coming soon.</div>}
          </>
        )}
      </div>
    </div>
  );
}