"use client"
import { submitOtpStudent } from '@/redux/actions/userAction';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redirect, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import Swal from 'sweetalert2'; // SweetAlert2 for user notifications
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'; // React Icons

import "react-toastify/dist/ReactToastify.css";

function Code() {
    const [inputs, setInputs] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, error } = useSelector((state) => state.user);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (user) {
          redirect('/');
        }
    }, [user]);

    const handleKeyDown = (e, index) => {
        if (
            !/^[0-9]{1}$/.test(e.key)
            && e.key !== 'Backspace'
            && e.key !== 'Delete'
            && e.key !== 'Tab'
            && !e.metaKey
        ) {
            e.preventDefault();
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (index > 0) {
                const newInputs = [...inputs];
                newInputs[index - 1] = '';
                setInputs(newInputs);
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handleInputChange = (e, index) => {
        const newInputs = [...inputs];
        newInputs[index] = e.target.value;
        setInputs(newInputs);

        if (e.target.value && index < inputs.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleFocus = (index) => {
        inputRefs.current[index].select();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text');
        if (!new RegExp(`^[0-9]{${inputs.length}}$`).test(text)) {
            return;
        }
        const digits = text.split('');
        const newInputs = digits.slice(0, inputs.length);
        setInputs(newInputs);
        inputRefs.current[inputs.length - 1].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = inputs.join('');
        console.log('Verification code:', verificationCode);
        const code = { activationCode: verificationCode };
        const response = await dispatch(submitOtpStudent(code));

        if (response === "successfully register") {
            Swal.fire({
                icon: 'success',
                title: 'Verification Successful',
                text: response,
                confirmButtonText: 'OK',
                iconColor: '#4CAF50', // Green success color
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: response,
                confirmButtonText: 'OK',
                iconColor: '#f44336', // Red error color
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                }
            });
        }
    };

    return (
        <div className='w-full h-[100vh] flex justify-center items-center bg-gray-100'>
            <div className="max-w-md mx-auto text-center bg-white px-8 py-10 rounded-xl shadow-lg">
                <header className="mb-8">
                    <h1 className="text-3xl font-semibold mb-2">Email Verification</h1>
                    <p className="text-sm text-gray-500">Enter the 4-digit verification code sent to your email address.</p>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {inputs.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                className="w-16 h-16 text-center text-3xl font-bold text-gray-800 bg-gray-200 border border-gray-300 hover:border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={value}
                                onChange={(e) => handleInputChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={() => handleFocus(index)}
                                onPaste={handlePaste}
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)}
                            />
                        ))}
                    </div>
                    <div className="max-w-[260px] mx-auto mt-4">
                        <button
                            type="submit"
                            className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-4 py-3 text-lg font-semibold text-white shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <FaCheckCircle className="mr-2" /> Verify Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Code;
