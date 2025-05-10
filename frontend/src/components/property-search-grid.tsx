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

  const fetchAllProperties = async () => {
    const res = await fetch('http://localhost:3001/api/properties/search');
    const data = await res.json();
    setResults(data);
  };

  const fetchCreditCards = async () => {
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
    const data = await res.json();
    setCreditCards(Array.isArray(data) ? data : [data]);
  };

  useEffect(() => {
    fetchAllProperties();
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
    if (!input || !input.start || !input.end || !input.credit_id) return alert('Please complete all fields');

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

    if (res.ok) {
      alert('Booking successful');
    } else {
      const data = await res.json();
      alert(data.error || 'Booking failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">Available Properties</h2>
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
                  <button onClick={() => handleBook(p.prop_id)} className="bg-green-600 text-white px-4 py-2 rounded">Book</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}