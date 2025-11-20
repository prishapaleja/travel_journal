import React, { useState } from 'react';
import { MapPin, Plus, Calendar, User, LogOut, BookOpen, Edit, Trash2 } from 'lucide-react';

export default function App() {
  const [page, setPage] = useState('login');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  
  // New trip form
  const [newTrip, setNewTrip] = useState({ title: '', destination: '', startDate: '', endDate: '' });
  
  // New entry form
  const [newEntry, setNewEntry] = useState({ date: '', location: '', content: '', rating: 5 });

  const handleAuth = async () => {
    setMessage('');
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          setUser(data.user);
          loadTrips(data.user.id);
          setPage('dashboard');
        } else {
          setMessage('Registration successful! Please login.');
          setIsLogin(true);
        }
      } else {
        setMessage(data.message || 'Something went wrong');
      }
    } catch (err) {
      setMessage('Cannot connect to server');
    }
  };

  const loadTrips = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/trips/${userId}`);
      const data = await res.json();
      if (res.ok) setTrips(data);
    } catch (err) {
      console.error('Error loading trips');
    }
  };

  const loadEntries = async (tripId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/entries/${tripId}`);
      const data = await res.json();
      if (res.ok) setEntries(data);
    } catch (err) {
      console.error('Error loading entries');
    }
  };

  const createTrip = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTrip, userId: user.id })
      });

      if (res.ok) {
        loadTrips(user.id);
        setNewTrip({ title: '', destination: '', startDate: '', endDate: '' });
        setPage('dashboard');
      }
    } catch (err) {
      console.error('Error creating trip');
    }
  };

  const createEntry = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, tripId: selectedTrip._id })
      });

      if (res.ok) {
        loadEntries(selectedTrip._id);
        setNewEntry({ date: '', location: '', content: '', rating: 5 });
        setPage('journal');
      }
    } catch (err) {
      console.error('Error creating entry');
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      await fetch(`http://localhost:5000/api/trips/${tripId}`, { method: 'DELETE' });
      loadTrips(user.id);
    } catch (err) {
      console.error('Error deleting trip');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTrips([]);
    setEntries([]);
    setPage('login');
    setEmail('');
    setPassword('');
  };

  // LOGIN/REGISTER PAGE
  if (page === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <MapPin className="w-12 h-12 text-teal-500 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-gray-800">Travel Journal</h1>
          </div>

          <div>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition mb-4"
            >
              {isLogin ? 'Login' : 'Register'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 text-center ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <p className="text-center text-gray-600">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
              }}
              className="text-teal-500 hover:underline"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // NAVIGATION
  const Navigation = () => (
    <nav className="bg-teal-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6" />
          <span className="text-xl font-bold">Travel Journal</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setPage('dashboard')} className="hover:text-teal-200 transition">
            Dashboard
          </button>
          <button onClick={() => setPage('profile')} className="hover:text-teal-200 transition">
            <User className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="hover:text-teal-200 transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );

  // DASHBOARD PAGE
  if (page === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">My Trips</h1>
            <button
              onClick={() => setPage('newTrip')}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> New Trip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <div key={trip._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{trip.title}</h2>
                  <button onClick={() => deleteTrip(trip._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.startDate} - {trip.endDate}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedTrip(trip);
                    loadEntries(trip._id);
                    setPage('journal');
                  }}
                  className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
                >
                  View Journal
                </button>
              </div>
            ))}
          </div>

          {trips.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No trips yet. Start your travel journey!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NEW TRIP PAGE
  if (page === 'newTrip') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto p-6 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Trip</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Trip Title</label>
              <input
                type="text"
                value={newTrip.title}
                onChange={(e) => setNewTrip({...newTrip, title: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Summer in Paris"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Paris, France"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newTrip.startDate}
                onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newTrip.endDate}
                onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={createTrip}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
              >
                Create Trip
              </button>
              <button
                onClick={() => setPage('dashboard')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // JOURNAL PAGE
  if (page === 'journal') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <button onClick={() => setPage('dashboard')} className="text-teal-600 hover:underline mb-2">
              ← Back to Trips
            </button>
            <h1 className="text-3xl font-bold text-gray-800">{selectedTrip.title}</h1>
            <p className="text-gray-600">{selectedTrip.destination}</p>
          </div>

          <button
            onClick={() => setPage('newEntry')}
            className="mb-6 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> New Entry
          </button>

          <div className="space-y-6">
            {entries.map(entry => (
              <div key={entry._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{entry.location}</h3>
                    <p className="text-gray-600">{entry.date}</p>
                  </div>
                  <div className="text-yellow-500">
                    {'★'.repeat(entry.rating)}{'☆'.repeat(5-entry.rating)}
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
              </div>
            ))}
          </div>

          {entries.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No entries yet. Start documenting your journey!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // NEW ENTRY PAGE
  if (page === 'newEntry') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto p-6 max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">New Journal Entry</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={newEntry.location}
                onChange={(e) => setNewEntry({...newEntry, location: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Where were you?"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Experience</label>
              <textarea
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-40"
                placeholder="Write about your day..."
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Rating: {newEntry.rating}/5</label>
              <input
                type="range"
                min="1"
                max="5"
                value={newEntry.rating}
                onChange={(e) => setNewEntry({...newEntry, rating: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="text-yellow-500 text-2xl">
                {'★'.repeat(newEntry.rating)}{'☆'.repeat(5-newEntry.rating)}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={createEntry}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition"
              >
                Save Entry
              </button>
              <button
                onClick={() => setPage('journal')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PROFILE PAGE
  if (page === 'profile') {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 bg-teal-50 rounded-lg">
                <div className="text-3xl font-bold text-teal-600">{trips.length}</div>
                <div className="text-gray-600">Total Trips</div>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {entries.length}
                </div>
                <div className="text-gray-600">Journal Entries</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}