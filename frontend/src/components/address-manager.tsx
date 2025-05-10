import { useEffect, useState } from 'react';

interface Address {
  address_id: number;
  address: string;
}

interface CreditCard {
  credit_id: number;
  address: string;
}

export default function AddressManager({ userId }: { userId: number }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState('');
  const [linkedAddresses, setLinkedAddresses] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`);
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : [data]);

      const resCards = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
      const cards = await resCards.json();
      const inUse = new Set<string>(cards.map((c: CreditCard) => c.address));
      setLinkedAddresses(inUse);
    };
    fetchData();
  }, [userId]);

  const handleDelete = async (addressId: number) => {
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses/${addressId}`, {
      method: 'DELETE'
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed to delete address');
      return;
    }

    setAddresses(addresses.filter(a => a.address_id !== addressId));
  };

  const handleAdd = async () => {
    await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    setAddress('');
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`);
    const data = await res.json();
    setAddresses(Array.isArray(data) ? data : [data]);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Addresses</h3>
      <ul className="space-y-2 mb-6">
        {addresses.map(addr => (
          <li key={addr.address_id} className="border p-3 rounded flex justify-between items-center">
            <span>{addr.address}</span>
            <button
              onClick={() => handleDelete(addr.address_id)}
              disabled={linkedAddresses.has(addr.address)}
              className={`text-red-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="New Address"
          className="w-full p-2 border rounded"
          value={address}
          onChange={e => setAddress(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Address
        </button>
      </div>
    </div>
  );
}