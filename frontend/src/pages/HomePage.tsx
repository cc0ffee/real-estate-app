import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 text-center px-4">
      <div>
        <h1 className="text-5xl font-bold mb-4">Find Your New Place</h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover different types of properties for your needs!
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-sm hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-sm hover:bg-gray-300 transition"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}