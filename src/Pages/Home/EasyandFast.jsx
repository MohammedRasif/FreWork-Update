import React from 'react';
import img1 from "../../assets/img/Rectangle 14305.png";
import img2 from "../../assets/img/Rectangle 14306.png";
import img3 from "../../assets/img/Rectangle 14307.png";
import img4 from "../../assets/img/Rectangle 14327.svg";
import img5 from "../../assets/img/Plane vector.svg";
import { CiHeart } from "react-icons/ci";
import { IoMdSend } from "react-icons/io";
import { MapPin, Send, Leaf, Users } from "lucide-react";

const EasyandFast = () => {
    return (
        <div className="mb-10 sm:mb-16 lg:mb-20">
            <img src={img4} alt="" className="absolute right-0 h-[25vh] sm:h-[35vh] lg:h-[50vh] -mt-16 sm:-mt-20 lg:-mt-32" />
            <img src={img4} alt="" className="absolute left-0 h-[25vh] sm:h-[35vh] lg:h-[50vh] rotate-180 mt-[60vh] sm:mt-[80vh] lg:mt-[110vh]" />
            <div className="font-sans relative flex flex-col items-center justify-center max-w-7xl mx-auto py-8 sm:py-10 lg:py-12">
                {/* Benefits and Trip Card Section */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 sm:mb-12 lg:mb-20 gap-6 sm:gap-8 lg:gap-100">
                    {/* Benefits List */}
                    <div className="w-full lg:w-1/2 px-4 sm:px-6">
                        <div className="mb-8 sm:mb-10 lg:mb-10">
                            <span className="inline-block mb-3 sm:mb-4 text-[15px] sm:text-lg lg:text-xl text-gray-700 font-medium">
                                Easy and Fast
                            </span>
                            <h1 className="text-[20px] sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-bold leading-tight lg:px-2 sm:px-4">
                                WHY USE <br /> VacanzaMyCost.it?
                            </h1>
                        </div>

                        <div className="space-y-8 sm:space-y-10">
                            <div className="flex items-start">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shrink-0">
                                    <img src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1748100792/Group_12_ziiomp.svg" alt="" />
                                </div>
                                <div className="px-2 sm:px-4">
                                    <p className="text-lg sm:text-xl font-bold text-gray-800 mb-1 -mt-1">NO COMMISSION</p>
                                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Utma. tortor tempus.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shrink-0">
                                    <img src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1748100792/Group_7_the57s.svg" alt="" />
                                </div>
                                <div className="px-2 sm:px-4">
                                    <p className="text-lg sm:text-xl font-bold text-gray-800 mb-1 -mt-1">FAST REPLIES</p>
                                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Utma. tortor tempus.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shrink-0 ">
                                    <img src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1748100792/Group_11_n4edkj.svg" alt="" />
                                </div>
                                <div className="px-2 sm:px-4">
                                    <p className="text-lg sm:text-xl font-bold text-gray-800 mb-1 -mt-1">ONLY VERIFIED AGENCIES</p>
                                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Utma. tortor tempus.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trip Card */}
                    <div className="relative w-full lg:w-auto min-w-[280px] sm:min-w-[320px] lg:min-w-[430px] px-4 sm:px-6">
                        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xl border border-gray-100">
                            {/* Image Section */}
                            <div className="relative h-40 sm:h-48 lg:h-64 bg-white overflow-hidden rounded-xl mb-3 sm:mb-4">
                                <img
                                    src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529169/samples/sheep.jpg"
                                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 "
                                    alt="Trip to Greece"
                                />
                                <button className="absolute right-3 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors hover:bg-white">
                                    <CiHeart size={18} sm:size={20} className="text-gray-700" />
                                </button>
                            </div>

                            {/* Content Section */}
                            <div className="p-3 sm:p-4">
                                {/* Title */}
                                <div className="mb-3 sm:mb-4">
                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 leading-tight">Trip To Greece</h3>
                                    <p className="text-gray-500 text-xs sm:text-sm">14-29 June | by Robbin Joseph</p>
                                </div>

                                {/* Icons */}
                                <div className="flex items-center gap-2 mb-4 sm:mb-5 mt-3 sm:mt-4">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    </div>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    </div>
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                    </div>
                                </div>

                                {/* People Going */}
                                <div className="flex items-center">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 mr-2" />
                                    <span className="text-gray-600 text-xs sm:text-sm font-medium">24 People Going</span>
                                </div>
                            </div>
                        </div>

                        {/* Ongoing Trip */}
                        <div className="absolute top-[249px] sm:top-[300px] lg:top-[381px] right-4 sm:-right-6 lg:-right-8 bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200 max-w-[180px] sm:max-w-[200px]">
                            <div className="flex items-center">
                                <img
                                    src="https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529169/samples/landscapes/architecture-signs.jpg"
                                    alt="Profile"
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 object-cover border-2 border-white  "
                                />
                                <div>
                                    <div className="flex items-center">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 mr-1 sm:mr-1.5"></div>
                                        <p className="text-xs font-medium text-green-600">Ongoing</p>
                                    </div>
                                    <p className="text-sm sm:text-md font-semibold text-gray-800">Trip to Rome</p>
                                    <div className="w-20 sm:w-24 h-1.5 bg-gray-200 rounded-full mt-1 sm:mt-1.5 mb-1">
                                        <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: '40%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500">40% Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Your Agency Section */}
                <div className="flex flex-col lg:flex-row items-center pt-0 sm:pt-24 lg:pt-52 gap-8 sm:gap-10 lg:gap-12">
                    {/* Images Section */}
                    <div className="relative mr-0 lg:mr-8 w-full lg:w-1/2 h-[40vh] sm:h-[50vh] lg:h-[50vh]">
                        <img
                            src={img1}
                            alt="Destination 1"
                            className="w-[70vw] sm:w-72 lg:w-96 h-[50vh] sm:h-[40vh] lg:h-[60vh]  rounded-3xl"
                        />
                        <img
                            src={img3}
                            alt="Destination 3"
                            className="w-28 sm:w-36 lg:w-44 h-32 sm:h-40 lg:h-52 object-cover rounded-3xl absolute top-20 sm:top-32 lg:top-44 left-[60vw] sm:left-[22vw] lg:left-[32vh] z-20"
                        />
                        <img
                            src={img2}
                            alt="Destination 2"
                            className="w-28 sm:w-36 lg:w-44 h-32 sm:h-40 lg:h-52 object-cover rounded-3xl absolute -bottom-5 sm:-bottom-10 lg:-bottom-14 left-[60vw] sm:left-[22vw] lg:left-[32vh] z-10"
                        />
                        <img
                            src={img5}
                            alt="Plane vector"
                            className="absolute left-48 sm:left-56 lg:left-80 w-[40vw] sm:w-[50vw] lg:w-[70vh] -ml-4 -mt-4 -top-[30vh] sm:-top-[40vh] lg:-top-[55vh] hidden md:block"
                        />
                    </div>

                    {/* Text Section */}
                    <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:pt-0 pt-10">
                        <span className="inline-block mb-3 sm:mb-4 text-[15px] sm:text-lg lg:text-xl text-gray-700 font-medium lg:pl-0 pl-2">
                            Start Earning
                        </span>
                        <h1 className="text-[22px] sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 font-bold leading-tight pb-4 sm:pb-5 px-2 sm:px-4">
                            Add Your Agency to <br className="hidden md:block" />
                            <span className="">VacanzaMyCost.it</span>
                        </h1>
                        <div className="space-y-3 sm:space-y-4 text-gray-600 px-2 sm:px-4">
                            <p className="text-sm sm:text-md leading-relaxed">
                                Amet cursus vulputate sit amet dictum. At erat pellentesque adipiscing commodo. Sit amet volut pat consectetur mauris nunc congue nisi vitae suscipit in arcu cursus euis mod quis viverra nibh cras pulvinar. Vulputate eu scelerisques felis imperdiet proin fermentum.
                            </p>
                            <p className="text-sm sm:text-md leading-relaxed">
                                Rutrum quisque non tellus orci ac. Varius vel pharetra vel turpis nunc eget lorem dolor sed. Interdum posuere lorem ipsum dolor sit. Egestas maecenas pharetra convallis posuere morbi.
                            </p>
                        </div>

                        <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6 px-2 sm:px-4">
                            <a href="#" className="group flex items-center text-sm sm:text-md font-medium">
                                <IoMdSend className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-blue-600 transition-transform group-hover:translate-x-1 font-bold" />
                                Done adipiscing tristique risus nec feugiat in
                            </a>
                            <a href="#" className="group flex items-center text-sm sm:text-md font-medium transition-colors">
                                <IoMdSend className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-blue-600 transition-transform group-hover:translate-x-1 font-bold" />
                                Done adipiscing tristique risus nec feugiat in
                            </a>
                            <a href="#" className="group flex items-center text-sm sm:text-md font-medium transition-colors">
                                <IoMdSend className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 text-blue-600 transition-transform group-hover:translate-x-1 font-bold" />
                                Done adipiscing tristique risus nec feugiat in
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EasyandFast;