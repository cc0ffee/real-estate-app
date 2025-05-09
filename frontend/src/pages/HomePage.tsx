import { useNavigate } from "react-router-dom";
export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col">
      <div className="text-center py-20 bg-slate-100">
        <h1 className="text-5xl font-bold mb-4">Find Your New Place</h1>
        <p className="text-lg text-gray-600 mb-6">Discover different types of properties for your needs!</p>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-sm hover:bg-blue-700 transition">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-sm hover:bg-gray-300 transition">
            Register
          </button>
        </div>
      </div>

      <div className="container px-4 md:px-6">
        <h2 className="text-2xl font-semibold sm:text-3xl m-8">Featured Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    
        </div>
      </div>

    </div>
  )
}
