import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register({ setUser }: { setUser: Function }) {
  const [isAgent, setIsAgent] = useState<boolean | null>(null);
  const [formData, setFormData] = useState({email: '', name: '', password: '', jobTitle: '', agency: '', contactInfo: '', moveInDate: '', preferredLocation: '', budget: ''});

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const json_body = {email: formData.email,name: formData.name,password: formData.password,isAgent,
      jobTitle: formData.jobTitle,agency: formData.agency,contactInfo: formData.contactInfo,moveInDate: formData.moveInDate,
      preferredLocation: formData.preferredLocation,budget: formData.budget};

    const result = await fetch('http://localhost:3001/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json_body),
      credentials: 'include'
    });

    const data = await result.json();
    if (data.message) {
      setUser(data.user);
      navigate('/dashboard');
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      <h2 className="text-xl font-semibold mb-4">I am a...</h2>

      {isAgent === null && (
        <div className="flex gap-6 mb-6">
          <div
            onClick={() => setIsAgent(false)}
            className="cursor-pointer p-6 bg-white shadow rounded-lg w-64 text-center border hover:border-gray-400"
          >
            <div className="text-4xl mb-2">👤</div>
            <div className="font-bold mb-1">Prospective Renter</div>
            <div className="text-sm text-gray-600">I want to find and book properties</div>
          </div>
          <div
            onClick={() => setIsAgent(true)}
            className="cursor-pointer p-6 bg-white shadow rounded-lg w-64 text-center border hover:border-gray-400"
          >
            <div className="text-4xl mb-2">🏢</div>
            <div className="font-bold mb-1">Property Agent</div>
            <div className="text-sm text-gray-600">I want to list and manage properties</div>
          </div>
        </div>
      )}

      {isAgent !== null && (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded-lg w-full max-w-md">
          <h3 className="text-lg font-medium mb-4">Register as {isAgent ? 'Property Agent' : 'Prospective Renter'}</h3>

          <input type="text" name="name" placeholder="Full Name" className="w-full mb-3 p-2 border rounded" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="w-full mb-3 p-2 border rounded" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="w-full mb-3 p-2 border rounded" onChange={handleChange} required />

          {isAgent ? (
            <div>
              <input type="text" name="jobTitle" placeholder="Job Title" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
              <input type="text" name="agency" placeholder="Agency" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
              <input type="text" name="contactInfo" placeholder="Contact Info" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
            </div>
          ) : (
            <div>
              <input type="date" name="moveInDate" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
              <input type="text" name="preferredLocation" placeholder="Preferred Location" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
              <input type="number" name="budget" placeholder="Budget" className="w-full mb-3 p-2 border rounded" onChange={handleChange} />
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Register
          </button>
        </form>
      )}
    </div>
  );
}