import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage({ setUser }: { setUser: Function }) {
  const [formData, setFormData] = useState({email: ''});
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await fetch('http://localhost:3001/api/users/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
      credentials: 'include',
    });
    const data = await result.json();
    if (data.message) {
      const isAgent = data.is_agent ?? false;
      setUser({user_id: data.user_id, is_agent: isAgent});
      navigate('/dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
          <h2 className="text-xl font-semibold mb-6">Sign in</h2>

          <label className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" name="email" placeholder="Enter your email" className="w-full p-2 mb-4 border rounded" onChange={handleChange} required/>

          <label className="block mb-2 text-sm font-medium">Password</label>
          <input type="password" name="password" placeholder="Enter your password" className="w-full p-2 mb-4 border rounded" onChange={handleChange} required/>

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
          Sign in
        </button>
        </form>
      </div>
    )
  }
  