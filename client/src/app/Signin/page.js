"use client";
import React, { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/redux/actions/userAction";
import Link from "next/link";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();

  const { user, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user?.isAdmin) {
        redirect("/Admin/Dashbord");
      }
      redirect("/");
    }
  }, [user]);

  const Submitsignin = (e) => {
    e.preventDefault();
    const data = { email, password };
    dispatch(loginUser(data));
  };

  return (
    <>
      <section className="bg-gradient-to-r from-blue-500  min-h-screen flex items-center justify-center pb-12 pt-5 px-6">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-blue-700">
          <div className="grid grid-cols-2">
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
                Distributor Sign in
              </a>
            </div>
          </div>

          <form onSubmit={Submitsignin}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="name@company.com"
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="••••••••"
                required
                onChange={(e) => setpassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-transparent text-blue-900 border border-black font-serif   font-semibold rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Sign In
            </button>

            <p className="text-sm text-center mt-4 text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                href="/Signup"
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-500"
              >
                Sign Up
              </Link>
            </p>
          </form>

          {/* Back to Home Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/")}
              className="w-full bg-transparent text-black border border-black font-serif font-semibold rounded-lg py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Back to Home
            </button>
          </div>
        </div>
      </section>
      <ToastContainer />
    </>
  );
};

export default Signin;
