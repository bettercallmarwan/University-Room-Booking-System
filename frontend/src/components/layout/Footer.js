import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <div className="container text-center">
        <p className="mb-0">University Room Booking System &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;