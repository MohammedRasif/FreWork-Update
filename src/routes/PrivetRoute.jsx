import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const access_token = localStorage.getItem("access_token");

  return access_token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;