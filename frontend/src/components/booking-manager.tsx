import { useEffect, useState } from 'react';

interface Booking {
  book_id: number;
  prop_id: number;
  address: string;
  city: string;
  state: string;
  amount: number;
  start: string;
  end: string;
  card_number: string;
  renter_name?: string;
}

interface BookingManagerProps {
  userId: number;
  isAgent: boolean;
}

export default function BookingManager({ userId, isAgent }: BookingManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    const rolePath = isAgent ? 'agent' : 'renter';
    const res = await fetch(`http://localhost:3001/api/bookings/${rolePath}/${userId}`);
    const data = await res.json();
    setBookings(Array.isArray(data) ? data : []);
  };

  const cancelBooking = async (bookId: number) => {
    const res = await fetch(`http://localhost:3001/api/bookings/${bookId}`, { method: 'DELETE' });
    if (res.ok) {
      setBookings(prev => prev.filter(b => b.book_id !== bookId));
      alert('Booking cancelled');
    } else {
      alert('Failed to cancel booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return Math.max(days, 0);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{isAgent ? 'Agent Bookings' : 'My Bookings'}</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map(b => {
            const days = calculateDays(b.start, b.end);
            const total = (b.amount * days).toFixed(2);

            return (
              <div key={b.book_id} className="border p-4 rounded shadow">
                <h3 className="font-semibold mb-1">{b.address}, {b.city}, {b.state}</h3>
                <p><strong>Rental Period:</strong> {b.start} → {b.end} ({days} days)</p>
                <p><strong>Price per Day:</strong> ${b.amount}</p>
                <p><strong>Total:</strong> ${total}</p>
                <p><strong>Card:</strong> ****{b.card_number?.slice(-4)}</p>
                {isAgent && <p><strong>Renter:</strong> {b.renter_name}</p>}
                <button onClick={() => cancelBooking(b.book_id)} className="mt-2 bg-red-600 text-white px-4 py-1 rounded">Cancel</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}