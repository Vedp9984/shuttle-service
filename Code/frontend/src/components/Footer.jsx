import React from "react";

const Footer = () => {
  return (
    <footer className="bg-yellow-400 text-gray-800 py-4 mt-10 text-center">
      &copy; {new Date().getFullYear()} Shuttle Service. All rights reserved.
    </footer>
  );
};

export default Footer;
