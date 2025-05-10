import { useEffect, useState } from 'react';

interface Property {
  prop_id: number;
  address: string;
  city: string;
  state: string;
  description: string;
  availability: boolean;
  type: string;
}

interface PropertyForm {
  address: string;
  city: string;
  state: string;
  description: string;
  availability: boolean;
  type: string;
  subtypeData: any;
}

interface PropertyManagerProps {
  userId: number;
}

export default function PropertyManager({ userId }: PropertyManagerProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [form, setForm] = useState<PropertyForm>({
    address: '',
    city: '',
    state: '',
    description: '',
    availability: true,
    type: '',
    subtypeData: {}
  });
  const [editId, setEditId] = useState<number | null>(null);

  const fetchProperties = async () => {
    const res = await fetch(`http://localhost:3001/api/agents/${userId}/properties`);
    const data = await res.json();
    setProperties(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async () => {
    const url = editId
      ? `http://localhost:3001/api/properties/${editId}`
      : 'http://localhost:3001/api/properties';

    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: userId })
    });

    if (res.ok) {
      await fetchProperties();
      setForm({ address: '', city: '', state: '', description: '', availability: true, type: '', subtypeData: {} });
      setEditId(null);
    }
  };

  const handleDelete = async (propId: number) => {
    await fetch(`http://localhost:3001/api/properties/${propId}`, { method: 'DELETE' });
    setProperties(properties.filter(p => p.prop_id !== propId));
  };

  const handleEdit = (property: Property) => {
    setForm({ ...property, subtypeData: {} });
    setEditId(property.prop_id);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Manage Properties</h3>
      <ul className="space-y-2 mb-6">
        {properties.map(prop => (
          <li key={prop.prop_id} className="border p-3 rounded">
            <div><strong>{prop.type}</strong> - {prop.address}, {prop.city}, {prop.state}</div>
            <div>{prop.description}</div>
            <div className="text-sm text-gray-600">Available: {prop.availability ? 'Yes' : 'No'}</div>
            <div className="mt-2 space-x-4">
              <button onClick={() => handleEdit(prop)} className="text-blue-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(prop.prop_id)} className="text-red-600 hover:underline">Delete</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <input type="text" placeholder="Address" className="w-full p-2 border rounded" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
        <input type="text" placeholder="City" className="w-full p-2 border rounded" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        <input type="text" placeholder="State" className="w-full p-2 border rounded" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
        <input type="text" placeholder="Type (House, Apartment, etc)" className="w-full p-2 border rounded" value={form.type} onChange={e => setForm({ ...form, type: e.target.value, subtypeData: {} })} />
        <textarea placeholder="Description" className="w-full p-2 border rounded" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={form.availability} onChange={e => setForm({ ...form, availability: e.target.checked })} />
          <span>Available</span>
        </label>

        {/* Subtype Fields */}
        {form.type === 'House' && (
          <div className="space-y-2">
            <input type="number" placeholder="Rooms" className="w-full border p-2 rounded" value={form.subtypeData.rooms || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, rooms: Number(e.target.value) } })} />
            <input type="number" placeholder="Square Feet" className="w-full border p-2 rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
          </div>
        )}
        {form.type === 'Apartment' && (
          <div className="space-y-2">
            <input type="number" placeholder="Rooms" className="w-full border p-2 rounded" value={form.subtypeData.rooms || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, rooms: Number(e.target.value) } })} />
            <input type="number" placeholder="Square Feet" className="w-full border p-2 rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
            <input type="text" placeholder="Building Type" className="w-full border p-2 rounded" value={form.subtypeData.building_type || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, building_type: e.target.value } })} />
          </div>
        )}
        {form.type === 'CommercialBuilding' && (
          <div className="space-y-2">
            <input type="number" placeholder="Square Feet" className="w-full border p-2 rounded" value={form.subtypeData.sq_ft || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, sq_ft: Number(e.target.value) } })} />
            <input type="text" placeholder="Business Type" className="w-full border p-2 rounded" value={form.subtypeData.business_type || ''} onChange={e => setForm({ ...form, subtypeData: { ...form.subtypeData, business_type: e.target.value } })} />
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">{editId ? 'Update' : 'Add'} Property</button>
          {editId && <button onClick={() => { setEditId(null); setForm({ address: '', city: '', state: '', description: '', availability: true, type: '', subtypeData: {} }); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>}
        </div>
      </div>
    </div>
  );
}
