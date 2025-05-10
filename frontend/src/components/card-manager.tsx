import { useEffect, useState } from 'react';

interface CreditCardManagerProps {
  userId: number;
}

interface CreditCard {
  credit_id: number;
  card_number: string;
  exp_date: string;
  name: string;
  address: string;
}

export default function CreditCardManager({ userId }: CreditCardManagerProps) {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [form, setForm] = useState<Omit<CreditCard, 'credit_id'>>({
    card_number: '',
    exp_date: '',
    name: '',
    address: ''
  });

  const fetchCards = async () => {
    const result = await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`);
    const data = await result.json();
    if (data) setCards(Array.isArray(data) ? data : [data]);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleAdd = async () => {
    await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    await fetchCards();
    setForm({ card_number: '', exp_date: '', name: '', address: '' });
  };

  const handleDelete = async (creditId: number) => {
    await fetch(`http://localhost:3001/api/users/user/${userId}/credit_cards/${creditId}`, {
      method: 'DELETE'
    });
    fetchCards();
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Your Credit Cards</h3>
      <ul className="space-y-2 mb-6">
        {cards.map((card) => (
          <li key={card.credit_id} className="border p-2 rounded">
            <div><strong>Card:</strong> {card.card_number}</div>
            <div><strong>Name:</strong> {card.name}</div>
            <div><strong>Exp:</strong> {card.exp_date}</div>
            <div><strong>Address:</strong> {card.address}</div>
            <button onClick={() => handleDelete(card.credit_id)} className="text-red-600 hover:underline mt-2">Delete</button>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        <input name="card_number" type="text" placeholder="Card Number" value={form.card_number} onChange={e => setForm({...form, card_number: e.target.value})} className="w-full border p-2 rounded" />
        <input name="exp_date" type="date" placeholder="Expiration Date" value={form.exp_date} onChange={e => setForm({...form, exp_date: e.target.value})} className="w-full border p-2 rounded" />
        <input name="name" type="text" placeholder="Cardholder Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-2 rounded" />
        <input name="address" type="text" placeholder="Billing Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full border p-2 rounded" />
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </div>
    </div>
  );
}