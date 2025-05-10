import { useEffect, useState } from 'react';

interface AddressManagerProps {
    userId: number;
  }
  
  interface Address {
    address_id: number;
    address: string;
  }

export default function AddressManager({ userId }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState('');

  const fetchAddresses = async () => {
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`);
    const data = await res.json();
    if (data) {
        setAddresses(Array.isArray(data) ? data : [data]);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = async () => {
    const result = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: newAddress })
    });
    await fetchAddresses();
    setNewAddress('');
  };

  const handleDelete = async (addressId: number) => {
    const res = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses/${addressId}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (res.status === 400) alert(result.error);
    else fetchAddresses();
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Your Addresses</h3>
      <ul className="space-y-2 mb-6">
        {addresses.map(addr => (
          <li key={addr.address_id} className="flex justify-between items-center border p-2 rounded">
            <span>{addr.address}</span>
            <button onClick={() => handleDelete(addr.address_id)} className="text-red-600 hover:underline">Delete</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          className="border p-2 rounded w-full"
          placeholder="New Address"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>
    </div>
  );
}
