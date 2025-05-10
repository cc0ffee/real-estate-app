import { useEffect, useState } from 'react';

interface CreditCardManagerProps {
  userId: number;
}

interface Address {
  address_id: number;
  address: string;
}

interface CreditCard {
  credit_id: number;
  card_number: string;
  exp_date: string;
  name: string;
  address_id: number;
  address: string;
}

export default function CreditCardManager({ userId }: CreditCardManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [form, setForm] = useState({
    card_number: '',
    exp_date: '',
    name: '',
    address_id: 0
  });
  const [editCardId, setEditCardId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const resAddr = await fetch(`http://localhost:3001/api/users/user/${userId}/addresses`);
      const dataAddr = await resAddr.json();
      setAddresses(Array.isArray(dataAddr) ? dataAddr : [dataAddr]);

      const resCards = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
      const dataCards = await resCards.json();
      setCards(Array.isArray(dataCards) ? dataCards : [dataCards]);
    };
    fetchData();
  }, [userId]);

  const handleSubmit = async () => {
    const body = {
      card_number: form.card_number,
      exp_date: form.exp_date,
      name: form.name,
      address_id: form.address_id
    };

    const url = editCardId
      ? `http://localhost:3001/api/users/user/${userId}/credit_cards/${editCardId}`
      : `http://localhost:3001/api/users/user/${userId}/credit_cards`;
    const method = editCardId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const resCards = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
    const dataCards = await resCards.json();
    setCards(Array.isArray(dataCards) ? dataCards : [dataCards]);
    setForm({ card_number: '', exp_date: '', name: '', address_id: 0 });
    setEditCardId(null);
  };

  const handleEdit = (card: CreditCard) => {
    setForm({
      card_number: card.card_number,
      exp_date: card.exp_date,
      name: card.name,
      address_id: card.address_id
    });
    setEditCardId(card.credit_id);
  };

  const handleDelete = async (creditId: number) => {
    await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards/${creditId}`, {
      method: 'DELETE'
    });
    setCards(cards.filter(c => c.credit_id !== creditId));
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Credit Cards</h3>
      <ul className="space-y-2 mb-6">
        {cards.map(card => (
          <li key={card.credit_id} className="border p-3 rounded">
            <div><strong>Card:</strong> {card.card_number}</div>
            <div><strong>Name:</strong> {card.name}</div>
            <div><strong>Expires:</strong> {card.exp_date}</div>
            <div><strong>Billing Address:</strong> {card.address}</div>
            <div className="mt-2 space-x-4">
              <button onClick={() => handleEdit(card)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(card.credit_id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <input type="text" placeholder="Card Number" className="w-full p-2 border rounded" value={form.card_number} onChange={e => setForm({ ...form, card_number: e.target.value })} />
        <input type="date" placeholder="Exp Date" className="w-full p-2 border rounded" value={form.exp_date} onChange={e => setForm({ ...form, exp_date: e.target.value })} />
        <input type="text" placeholder="Cardholder Name" className="w-full p-2 border rounded" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <select className="w-full p-2 border rounded" value={form.address_id} onChange={e => setForm({ ...form, address_id: Number(e.target.value) })}>
          <option value={0}>Select Billing Address</option>
          {addresses.map(addr => (
            <option key={addr.address_id} value={addr.address_id}>{addr.address}</option>
          ))}
        </select>
        <div className="flex gap-4">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">{editCardId ? 'Update' : 'Add'} Card</button>
          {editCardId && <button onClick={() => { setEditCardId(null); setForm({ card_number: '', exp_date: '', name: '', address_id: 0 }); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </div>
    </div>
  );
}