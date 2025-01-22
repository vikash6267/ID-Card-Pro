"use client";
import React from "react";
import { FaPhone, FaEnvelope } from "react-icons/fa"; // Importing icons
import Nav from "../components/Nav";

const ContactPage = () => {
  return (
    <>

<Nav />

<section className="bg-gray-50 p-6 min-h-screen flex items-center justify-center">
  <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border border-gray-200">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Contact Information</h2>

    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
      <p className="text-gray-600 mb-2">
        <FaPhone className="inline mr-2 text-indigo-600" />
        <span className="font-medium text-gray-800">Contact No.:</span> 88818-88256
      </p>
      <p className="text-gray-600">
        <FaEnvelope className="inline mr-2 text-indigo-600" />
        <span className="font-medium text-gray-800">Email ID:</span> eagleart24@gmail.com
      </p>
    </div>

    <div className="text-center mt-4">
      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 focus:ring-4 focus:outline-none focus:ring-indigo-300 transition-colors">
        Contact Us
      </button>
    </div>
  </div>
</section>
    </>
    
  );
};

export default ContactPage;
