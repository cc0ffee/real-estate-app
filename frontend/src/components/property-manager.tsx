import { useEffect, useState } from 'react';

interface PropertyForm {
  address: string;
  city: string;
  state: string;
  description: string;
  availability: boolean;
  type: string;
  subtypeData: any;
  price: number;
}

interface Property {
  prop_id: number;
  address: string;
  city: string;
  state: string;
  description: string;
  availability: boolean;
  type: string;
  amount: number;
}

interface PropertyManagerProps {
  userId: number;
}

export default function PropertyManager({ userId }: PropertyManagerProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<PropertyForm>({
    address: '', city: '', state: '', description: '', availability: true, type: '', subtypeData: {}, price: 0
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProperties = async () => {
    const res = await fetch(`http://localhost:3001/api/properties/agent/${userId}`);
    const data = await res.json();
    setProperties(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async () => {
    const url = editId ? `http://localhost:3001/api/properties/${editId}` : 'http://localhost:3001/api/properties';
    const method = editId ? 'PUT' : 'POST';
    console.log("Submitting form:", { ...form, user_id: userId });
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: userId })
    });
    if (res.ok) {
      setForm({ address: '', city: '', state: '', description: '', availability: true, type: '', subtypeData: {}, price: 0 });
      setEditId(null);
      fetchProperties();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Manage Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {properties.map(p => (
          <div key={p.prop_id} className="border p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{p.type}</p>
              <div className="space-x-2">
                <button onClick={() => {
                  setForm({
                    address: p.address,
                    city: p.city,
                    state: p.state,
                    description: p.description,
                    availability: p.availability,
                    type: p.type,
                    subtypeData: {},
                    price: p.amount
                  });
                  setEditId(p.prop_id);
                }} className="text-blue-600 hover:underline">Edit</button>
                <button onClick={async () => {
                  if (confirm('Are you sure you want to delete this property?')) {
                    const res = await fetch(`http://localhost:3001/api/properties/${p.prop_id}?user_id=${userId}`, {
                      method: 'DELETE'
                    });
                    if (res.ok) fetchProperties();
                  }
                }} className="text-red-600 hover:underline">Delete</button>
              </div>
            </div>
            <p className="font-semibold">{p.type}</p>
            <p>{p.address}, {p.city}, {p.state}</p>
            <p className="text-sm text-gray-600">{p.description}</p>
            <p><strong>Price per Day:</strong> ${p.amount}</p>
            <p className="text-sm">Available: {p.availability ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <input type="text" placeholder="Address" className="w-full p-2 border rounded" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <input type="text" placeholder="City" className="w-full p-2 border rounded" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <input type="text" placeholder="State" className="w-full p-2 border rounded" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <input type="number" placeholder="Price per Day" className="w-full p-2 border rounded" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <select className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, subtypeData: {} })}>
          <option value="">Select Property Type</option>
          <option value="House">House</option>
          <option value="Apartment">Apartment</option>
          <option value="CommercialBuilding">CommercialBuilding</option>
        </select>
        <textarea placeholder="Description" className="w-full p-2 border rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        {form.type === 'House' && (
          <>
            <input type="number" placeholder="Rooms" className="w-full p-2 border rounded" value={form.subtypeData.rooms || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, rooms: Number(e.target.value) } })} />
            <input type="number" placeholder="Square Feet" className="w-full p-2 border rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
          </>
        )}
        {form.type === 'Apartment' && (
          <>
            <input type="number" placeholder="Rooms" className="w-full p-2 border rounded" value={form.subtypeData.rooms || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, rooms: Number(e.target.value) } })} />
            <input type="number" placeholder="Square Feet" className="w-full p-2 border rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
            <input type="text" placeholder="Building Type" className="w-full p-2 border rounded" value={form.subtypeData.building_type || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, building_type: e.target.value } })} />
          </>
        )}
        {form.type === 'CommercialBuilding' && (
          <>
            <input type="number" placeholder="Square Feet" className="w-full p-2 border rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
            <input type="text" placeholder="Business Type" className="w-full p-2 border rounded" value={form.subtypeData.business_type || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, business_type: e.target.value } })} />
          </>
        )}

        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} />
          <span>Available</span>
        </label>
        <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Add'} Property</button>
      </div>
    </div>
  );
}