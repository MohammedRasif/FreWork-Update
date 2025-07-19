import { useState, useEffect } from "react";
import { VscRobot } from "react-icons/vsc";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";

const AdminMessages = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current route
    const [selectedUserId, setSelectedUserId] = useState(null);

    const users = [
        { id: "U001", name: "Alice", number: "3", message: "hello", bot: "hello", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529179/cld-sample.jpg" },
        { id: "U002", name: "Bob", number: "2", message: "how are you", bot: "how are you", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529178/samples/man-portrait.jpg" },
        { id: "U003", name: "Charlie", number: "3", message: "are you ok", bot: "are you ok", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529177/samples/smile.jpg" },
        { id: "U008", name: "Ramis", number: "", message: "are you know me", bot: "are you know me", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529179/cld-sample.jpg" },
        { id: "U004", name: "Bijoy", number: "5", message: "are you know me", bot: "are you know me", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529173/samples/two-ladies.jpg" },
        { id: "U005", name: "Pappu", number: "", message: "show this", bot: "show this", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529169/samples/people/boy-snow-hoodie.jpg" },
        { id: "U006", name: "Rasif", number: "", message: "are you crazy", bot: "are you crazy", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529169/samples/people/smiling-man.jpg" },
        { id: "U007", name: "Sojib", number: "", message: "do you know me", bot: "do you know me", image: "https://res.cloudinary.com/dfsu0cuvb/image/upload/v1737529168/samples/people/kitchen-bar.jpg" },
    ];

    // Update selectedUserId based on the current route
    useEffect(() => {
        const pathParts = location.pathname.split("/");
        const userIdFromPath = pathParts[pathParts.length - 1];

        // Check if the route is for a user (not chatbot)
        if (pathParts.includes("Message") && users.some(user => user.id === userIdFromPath)) {
            setSelectedUserId(userIdFromPath);
        } else {
            setSelectedUserId(null); // Reset when on chatbot or other routes
        }
    }, [location.pathname]);

    const handleUserClick = (user) => {
        setSelectedUserId(user.id);
        navigate(`/Admin_Dashboard/Message/${user.id}`, { state: { user } });
    };

    const handleChatbotClick = () => {
        setSelectedUserId(null); // Ensure no user is selected
        navigate("/Admin_Dashboard/Message/chatbot");
    };

    // Check if the current route is the base route (/Admin_Dashboard/Message)
    const isBaseRoute = location.pathname === "/Admin_Dashboard/Message";

    return (
        <div className="p-10 roboto">
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Messages</h1>
            <div className="flex" style={{ height: "80vh" }}>
                {/* User List Sidebar */}
                <div className="w-1/4 rounded-l-lg bg-gray-50 dark:bg-[#1E232E] border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="m-3">
                        <input
                            type="text"
                            name=""
                            placeholder="Search"
                            className="border border-gray-300 rounded-md w-full pl-2 py-[10px]"
                            id=""
                        />
                    </div>

                    <div
                        onClick={handleChatbotClick}
                        className={`flex items-center space-x-2 px-[10px] py-[8px] mt-2 cursor-pointer ${
                            location.pathname === "/Admin_Dashboard/Message/chatbot"
                                ? "bg-[#B6E3FC]"
                                : "hover:bg-[#B6E3FC]"
                        }`}
                    >
                        <div className="bg-[#2F80A9] h-10 w-10 text-white flex items-center justify-center rounded-full">
                            <VscRobot size={25} />
                        </div>
                        <div className="text-md">
                            <h1 className="pt-1 font-semibold">Smart Ai Assistant</h1>
                        </div>
                    </div>

                    {/* User list container */}
                    <div className="overflow-y-auto flex-1">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => handleUserClick(user)}
                                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#252c3b] text-gray-700 dark:text-gray-200 transition-colors border-b border-gray-200 ${
                                    selectedUserId === user.id ? "bg-blue-100 dark:bg-[#2F80A9]" : ""
                                }`}
                            >
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full mr-3 object-cover"
                                />
                                <div className="relative">
                                    <span className="font-medium text-[15px]">{user.name}</span>
                                    {user.number && (
                                        <h1 className="absolute top-1 left-[28vh] text-[12px] bg-[#0B7EBB] text-white px-[5px] rounded-full">
                                            {user.number}
                                        </h1>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Default Message or Outlet */}
                <div className="w-3/4 bg-white dark:bg-[#252c3b] rounded-r-lg">
                    {isBaseRoute ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                    Select a Chat to Start Messaging
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    Choose a user or the Smart AI Assistant to begin your conversation.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <Outlet />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;