import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RoomList from './components/rooms/RoomList';
import RoomForm from './components/rooms/RoomForm';
import RoomDetails from './components/rooms/RoomDetails';
import BookingList from './components/bookings/BookingList';
import BookingForm from './components/bookings/BookingForm';
import BookingDetails from './components/bookings/BookingDetails';
import AdminDashboard from './components/AdminDashboard'; // Import AdminDashboard
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/layout/PrivateRoute';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/rooms" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Room Routes */}
            <Route path="/rooms" element={<RoomList />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route 
              path="/rooms/create" 
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <RoomForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/rooms/edit/:id" 
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <RoomForm />
                </PrivateRoute>
              } 
            />
            
            {/* Booking Routes */}
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute>
                  <BookingList />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings/:id" 
              element={
                <PrivateRoute>
                  <BookingDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings/create" 
              element={
                <PrivateRoute>
                  <BookingForm />
                </PrivateRoute>
              } 
            />
            {/* Admin Dashboard Route */}
            <Route 
              path="/bookings/admin" 
              element={
                <PrivateRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;