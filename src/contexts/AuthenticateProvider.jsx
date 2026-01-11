import React, { createContext, useContext } from "react";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import api from "../services/axiosConfig";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

function AuthenticateProvider({ children }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  let [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [isAuthenticated, setIsAuthenticated] = useState(!!cookies.token);
  const navigate = useNavigate();

  const logOut = () => {
    api.get("/auth/logout").then((res) => {
      removeCookie("token", { path: "/" });
      setUserInfo(null);
      setIsAuthenticated(false);
      navigate(1);
    });
  };

  useEffect(() => {
      api.get("/").then(({ data }) => {
        const { status, userInfo } = data;
        setUserInfo(userInfo);
        setIsAuthenticated(status);
      }).catch((error) => {
        console.log('Auth check failed:', error);
        setUserInfo(null);
        setIsAuthenticated(false);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <AuthContext.Provider
      value={{ logOut, isAuthenticated, setIsAuthenticated, userInfo, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthenticateProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
