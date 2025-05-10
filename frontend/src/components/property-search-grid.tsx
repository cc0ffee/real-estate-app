import { useState, useEffect } from 'react';

interface Property {
  prop_id: number;
  address: string;
  city: string;
  state: string;
  description: string;
  availability: boolean;
  type: string;
  amount: number;
  rooms: number;
}

interface CreditCard {
  credit_id: number;
  card_number: string;
  name: string;
}

interface PropertySearchGridProps {
  userId: number;
}

export default function PropertySearchGrid({ userId }: PropertySearchGridProps) {
  const [results, setResults] = useState<Property[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [bookingInputs, setBookingInputs] = useState<Record<number, any>>({});
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    type: '',
    min_price: '',
    max_price: '',
    min_bedrooms: '',
    order_by: ''
  });

  const fetchCreditCards = async () => {
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
    const data = await res.json();
    setCreditCards(Array.isArray(data) ? data : [data]);
  };

  const fetchFilteredProperties = async () => {
    const query = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value) query.append(key, value);
    }

    const res = await fetch(`http://localhost:3001/api/properties/search?${query.toString()}`);
    const data = await res.json();
    setResults(data);
  };

  useEffect(() => {
    fetchFilteredProperties();
    fetchCreditCards();
  }, []);

  const handleBookingChange = (propId: number, field: string, value: string) => {
    setBookingInputs(prev => ({
      ...prev,
      [propId]: {
        ...prev[propId],
        [field]: value
      }
    }));
  };

  const calculateTotalCost = (amount: number, start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return days > 0 ? (days * amount).toFixed(2) : '0.00';
  };

  const handleBook = async (propId: number) => {
    const input = bookingInputs[propId];
    if (!input?.start || !input?.end || !input?.credit_id) {
      return alert('Please complete all booking fields.');
    }

    const res = await fetch('http://localhost:3001/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prop_id: propId,
        user_id: userId,
        credit_id: input.credit_id,
        start: input.start,
        end: input.end
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert('Booking successful');
    } else {
      alert(data.error || 'Booking failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">Search Properties</h2>

      {/* 🔍 Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <input type="text" placeholder="City" className="border p-2 rounded w-full" value={filters.city} onChange={e => setFilters({ ...filters, city: e.target.value })} />
        <input type="text" placeholder="State" className="border p-2 rounded w-full" value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} />
        <select className="border p-2 rounded w-full" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="CommercialBuilding">Commercial Building</option>
        </select>
        <select className="border p-2 rounded w-full" value={filters.order_by} onChange={e => setFilters({ ...filters, order_by: e.target.value })}>
          <option value="">Sort By</option>
          <option value="price">Price</option>
          <option value="bedrooms">Bedrooms</option>
        </select>
        <input type="number" placeholder="Min Price" className="border p-2 rounded w-full" value={filters.min_price} onChange={e => setFilters({ ...filters, min_price: e.target.value })} />
        <input type="number" placeholder="Max Price" className="border p-2 rounded w-full" value={filters.max_price} onChange={e => setFilters({ ...filters, max_price: e.target.value })} />
        <input type="number" placeholder="Min Bedrooms" className="border p-2 rounded w-full" value={filters.min_bedrooms} onChange={e => setFilters({ ...filters, min_bedrooms: e.target.value })} />
        <button onClick={fetchFilteredProperties} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Search</button>
      </div>

      {/* 📦 Property Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(p => {
          const input = bookingInputs[p.prop_id] || {};
          const totalCost = input.start && input.end ? calculateTotalCost(p.amount, input.start, input.end) : null;

          return (
            <div key={p.prop_id} className="border p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-1">{p.type} in {p.city}, {p.state}</h3>
              <p className="text-sm text-gray-700 mb-2">{p.description}</p>
              <p><strong>Price:</strong> ${p.amount}</p>
              <p><strong>Bedrooms:</strong> {p.rooms || 'N/A'}</p>
              <p><strong>Available:</strong> {p.availability ? 'Yes' : 'No'}</p>

              {p.availability && (
                <div className="mt-4 space-y-2">
                  <input type="date" value={input.start || ''} onChange={e => handleBookingChange(p.prop_id, 'start', e.target.value)} className="w-full border p-2 rounded" />
                  <input type="date" value={input.end || ''} onChange={e => handleBookingChange(p.prop_id, 'end', e.target.value)} className="w-full border p-2 rounded" />
                  <select value={input.credit_id || ''} onChange={e => handleBookingChange(p.prop_id, 'credit_id', e.target.value)} className="w-full border p-2 rounded">
                    <option value="">Select Card</option>
                    {creditCards.map(card => (
                      <option key={card.credit_id} value={card.credit_id}>{card.card_number}</option>
                    ))}
                  </select>
                  {totalCost && <p><strong>Total Cost:</strong> ${totalCost}</p>}
                  <button
                        onClick={() => handleBook(p.prop_id)}
                        disabled={!p.availability}
                        className={`px-4 py-2 rounded w-full ${
                            p.availability
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        >
                        {p.availability ? 'Book' : 'Unavailable'}
                    </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}