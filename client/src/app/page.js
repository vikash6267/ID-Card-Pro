"use client";
import { currentUser, logoutUser } from "@/redux/actions/userAction";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Nav from "./components/Nav";
import {
  FaHome,
  FaSignInAlt,
  FaSchool,
  FaInfoCircle,
  FaPhoneAlt,
} from "react-icons/fa"; // Example icons
import { FaFileExcel, FaUser } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa"; // Importing React Icons

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { user, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      dispatch(currentUser());
    }
    if (user?.role == "school") {
      router.push("/Viewdata")
    }
  }, [user, dispatch]);


  useEffect(() => {
    localStorage.removeItem("currSchool");
    localStorage.removeItem("currRole");
    localStorage.removeItem("status");
    localStorage.removeItem("searchLocal");
    localStorage.removeItem("classValuelocal");
    localStorage.removeItem("sectionValuelocal");
  }, []);
  const redirectToAddSchool = () => {
    if (!user) {
      router.push("./signin");
    }
    router.push("/Addschool");
  };

  const redirectToSchools = () => {
    if (!user) {
      router.push("./signin");
    }
    router.push("/SchoolList");
  };

  const redirectToAdddata = () => {
    if (!user) {
      router.push("./signin");
    }
    router.push("/Adddata");
  };

  const redirectToExcel = () => {
    if (user) {
      router.push("./signin");
    }
    router.push("/Addexcel");
  };

  const redirectToViewData = () => {
    if (user) {
      router.push("./signin");
    }
    router.push("/Viewdata");
  };

  const LogoutUser = () => {
    dispatch(logoutUser());
  };

  const navItems = [
    { icon: <FaHome />, label: "Home", link: "/" },
    { icon: <FaSignInAlt />, label: "Distributor Login", link: "/Signin" },
    { icon: <FaSchool />, label: "Vendor Login", link: "/SchoolSignin" },
    { icon: <FaInfoCircle />, label: "About Us", link: "/About" },
    { icon: <FaPhoneAlt />, label: "Contact Us", link: "/Contact" },
  ];


  const links = [
    {
      href: "/Addschool",
      label: "Add Vendor",
      icon: <FaSchool />,
      visibleFor: "school", // Only show for users who are not "school"
    },
    {
      href: "/SchoolList",
      label: "Vendor List",
      icon: <FaUser />,
      visibleFor: "school", // Only show for users who are not "school"
    },
    {
      href: "/Addexcel",
      label: "Import Data",
      icon: <FaFileExcel />,
      visibleFor: "school", // Only show for users who are not "school"
    },
    // {
    //   href: "/Adddata",
    //   label: "Add Data Manually",
    //   icon: <FaUser />,
    //   visibleFor: "all", // Visible for all users
    // },
    {
      href: "/Viewdata",
      label: "View Data",
      icon: <FaFileExcel />,
      visibleFor: "all", // Visible for all users
    },

    {
      href: "/",
      label: "Logout",
      icon: <FaHome />,
      visibleFor: "all", // Visible for all users
      onClick: LogoutUser, // Add onClick for logout
      className: "text-yellow-400", // Additional class for styling
    },
  ];
  
  const filteredLinks = links.filter(link => 
    link.visibleFor === "all" || (user?.role !== "school" && link.visibleFor !== "school")
  );
  return (
    <>
      <Nav />

      <div className="relative min-h-screen min-w-full overflow-hidden bg-gray-100">
        <div className="relative z-10 flex  min-h-screen w-[80vw] pt-[60px] mx-auto">
          {!user && (
            <div className=" items-center justify-center flex w-full">
              <div className=" text-gray-900 p-4 flex min-w-[100%] flex-wrap flex-row    ">
                {/* Name */}
                <div className=" lg:w-[55%] md:w-[55%] w-full  mx-auto min-h-full lg:ml-[100px] md:ml-[100px]   flex-1 items-center justify-center mt-[13%]">
                  <h3 className="text-6xl font-bold my-1">
                    Card<span className=" text-blue-500">Pro</span>
                  </h3>
                  <p className="lg:text-2xl text-xl text-blue-600 font-semibold">
                    Id Card Data Portal
                  </p>
                </div>
                {/* Content */}
                <div className="lg:w-[40%] md:w-[40%] w-full font-normal mr-10 flex-1">
                  <ul>
                    {navItems.map((item, index) => (
                      <li
                        key={index}
                        className=" py-5  text-xl flex items-center justify-start space-x-3"
                      >
                        {item.icon}
                        <Link
                          href={item.link}
                          className="font-semibold bg-blue-200 hover:bg-blue-500 hover:text-white text-black rounded-lg py-1.5 px-3 cursor-pointer transition-colors lg:w-[50%] w-full"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="text-white flex items-center min-w-full flex-col justify-center mt-[20px] lg:-mt-[170px] md:-mt-[60px]">
              {/* Name */}

              <div className="flex flex-col lg:flex-row justify-between w-full px-5 py-4 bg-white rounded-lg shadow-lg">
                <div className="mobile mb-4 lg:mb-0">
                  <h3 className="text-[12px] lg:text-[18px] font-semibold text-black">
                    Card<span className="text-blue-500">Pro</span>
                  </h3>
                  <p className="text-[16px] text-blue-400 font-medium">
                    Id Card Data Portal
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 text-[14px] text-black">
                  <p className="flex items-center gap-1 text-blue-500">
                    {user?.role !== "school" ? (
                      <>
                        <FaUser /> Distributor
                      </>
                    ) : (
                      <>
                        <FaSchool /> Vendor
                      </>
                    )}
                  </p>
                  <span className="text-sm font-semibold text-black">
                    {" :- "}
                    <span>{user?.name ? user.name : user?.school?.name}</span>
                  </span>
                  {user?.email ? (
                    <span className="font-semibold text-black">
                      <FaEnvelope className="inline-block mr-1" /> {user.email}
                    </span>
                  ) : (
                    <span className="font-semibold text-black">
                      {user?.school?.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="my-[50px] w-full lg:px-10">
                <div className="grid lg:grid-cols-3  w-full place-content-center lg:place-content-between lg:gap-20 gap-10">
                  {user?.role !== "school" && (
                    <div>
                      <Link
                        href="/Addschool"
                        className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full min-w-full py-1.5 px-6 cursor-pointer bg-gray-900 bg-opacity-90 flex items-center justify-center gap-2"
                      >
                        <FaSchool /> Add Vendor
                      </Link>
                    </div>
                  )}
                  {user?.role !== "school" && (
                    <div>
                      <Link
                        href="/SchoolList"
                        className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full py-1.5 px-6 cursor-pointer bg-gray-900 bg-opacity-90 flex items-center justify-center gap-2"
                      >
                        <FaUser /> Vendor List
                      </Link>
                    </div>
                  )}
                  {user?.role !== "school" && (
                    <div>
                      <Link
                        href="/Addexcel"
                        className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full py-1.5 px-6 cursor-pointer bg-gray-900 bg-opacity-90 flex items-center justify-center gap-2"
                      >
                        <FaFileExcel /> Import Data
                      </Link>
                    </div>
                  )}

                  {/* <div>
                    <Link
                      href="/Adddata"
                      className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full py-1.5 px-2 cursor-pointer bg-gray-900 bg-opacity-90 flex items-center justify-center gap-2"
                    >
                      <FaUser /> Add Data Manually
                    </Link>
                  </div> */}
               
                  <div>
                    <Link
                      href="/Viewdata"
                      className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full py-1.5 px-6 cursor-pointer bg-gray-900 bg-opacity-90 flex items-center justify-center gap-2"
                    >
                      <FaFileExcel /> View Data
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/"
                      onClick={LogoutUser}
                      className="lg:text-2xl text-xl font-semibold hover:text-white rounded-full py-1.5 px-6 cursor-pointer bg-gray-900 bg-opacity-90 text-yellow-400 flex items-center justify-center gap-2"
                    >
                      <FaHome /> Logout
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
