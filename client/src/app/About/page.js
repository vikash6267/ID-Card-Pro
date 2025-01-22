import React from 'react';

import Link from 'next/link';

const AboutUs = () => {

  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white py-6 px-8">
            <h1 className="text-3xl font-bold">About Us</h1>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Card Pro</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Card Pro is a digital Data Application by Eagle Art. We are leading business professionals in creating different types of Identity Cards. Pursuing impeccable levels of integrity and the highest standards have always been our main focus. We have successfully provided and maintained our highest level of quality service and cost-effectiveness to our customers.
            </p>
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-2">
                  <span className="font-medium text-gray-800">Contact No.:</span> 88818-88256
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Email ID:</span> eagleart24@gmail.com
                </p>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href={'/'} 
                className="bg-blue-600 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
