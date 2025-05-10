import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
//import DashboardPage from './pages/DashboardPage';
import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser} />} />
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
      </Routes>
    </Router>
  )
}

export default App
