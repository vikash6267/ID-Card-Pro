"use client"
import React, { useEffect, useState } from "react";
import { LiaCitySolid } from "react-icons/lia";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosContact } from "react-icons/io";
import { redirect, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from '@/redux/actions/userAction';
import Link from 'next/link';
import Image from 'next/image';

const Signup = () => {

  const [name, setname] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setcontact] = useState("");
  const [city, setcity] = useState("");
  const [district, setdistrict] = useState("");
  const [state, setstate] = useState("");
  const [companyName, setcompanyName] = useState("");
  const [password, setpassword] = useState("");
  const [confirmpassword, setconfirmpassword] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user?.isAdmin) {
        redirect("/")
      }
      redirect('/')
    }
  }, [user]);  

  const SubmitForm = async (e) => {
    e.preventDefault();
    if (password === confirmpassword) {
      const User = {
        name,
        email,
        city,
        contact,
        district,
        state,
        companyName,
        password,
        confirmpassword,
      };
      const response = await dispatch(registerUser(User));
      if (response === "successfully send mail please check your Mail") {
        router.push("/Code")
      }
    } else {
      // Handle password mismatch here
    }
  }

  return (

    
    <section className="bg-gradient-to-r from-blue-500 py-10">
      <div className="container flex items-center justify-center min-h-screen px-6 mx-auto">
        <form className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-blue-700" onSubmit={SubmitForm} >
          <div className='grid grid-cols-2'>
            <div className="flex">
              <Image
                src="/login1.png"
                alt=""
                className="w-auto lg:h-32 h-16"
                height={200}
                width={200}
              />
            </div>
            <div className="flex items-center justify-center mt-6">
              <a
                href="#"
                className="pb-4 text-2xl font-medium text-center text-blue-800 capitalize border-b-2 border-indigo-600 dark:border-blue-400 dark:text-white"
              >
                Create A New Account
              </a>
            </div>
          </div>

          {/* Name Field */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <IoIosContact className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="text"
              className="block w-full py-3 text-gray-900 bg-yellow border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Name"
              required
              onChange={(e) => setname(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div className="relative flex items-center mt-6">
            <span className="absolute">
              <FaRegBuilding className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="email"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
            />
          </div>

          {/* Contact Field */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <IoIosContact className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="number"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setcontact(e.target.value)}
              maxLength="10"
              placeholder="Contact"
            />
          </div>

          {/* Company Name Field */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <FaRegBuilding className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="text"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setcompanyName(e.target.value)}
              placeholder="Company Name"
            />
          </div>

          {/* City, District, State Fields */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <LiaCitySolid className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="text"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setcity(e.target.value)}
              placeholder="City"
            />
          </div>

          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <LiaCitySolid className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="text"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setdistrict(e.target.value)}
              placeholder="District"
            />
          </div>

          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <LiaCitySolid className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="text"
              className="block w-full py-3 text-gray-700 bg-white border rounded-lg px-11 dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setstate(e.target.value)}
              placeholder="State"
            />
          </div>

          {/* Password Fields */}
          <div className="relative flex items-center mt-8">
            <span className="absolute">
              <FaRegBuilding className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="password"
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              required
              onChange={(e) => setpassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <div className="relative flex items-center mt-4">
            <span className="absolute">
              <FaRegBuilding className="text-gray-700 ms-3 text-xl" />
            </span>
            <input
              type="password"
              className="block w-full px-10 py-3 text-gray-700 bg-white border rounded-lg dark:bg-gray-900 dark:text-gray-700 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              placeholder="Confirm Password"
              required
              onChange={(e) => setconfirmpassword(e.target.value)}
            />
          </div>

          <div className="mt-6">
            <button
                          className="w-full bg-transparent text-blue-900 border border-black font-serif font-semibold rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"

              type="submit"
            >
              Sign Up
            </button>
            <div className="mt-6 text-center">
              <Link
                href="/Signin"
                className="text-sm hover:underline dark:text-blue-400"
              >
                Already have an account?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Signup;
