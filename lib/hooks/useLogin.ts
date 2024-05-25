"use client";

import Cookies from "js-cookie";
import { useConnectWallet } from "@/lib/hooks/useConnectWallet";
import { setCookie, removeCookie } from "typescript-cookie";
import { useState, useCallback } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { jwtDecode } from "jwt-decode";
import { useSupabase } from "@/app/providers/supabase";

export const useLogin = () => {
  const message = `I am signing this message to authenticate my address with my account on Meta links.`;
  const { isConnected, handleConnectWallet } = useConnectWallet();
  const { supabase, setToken } = useSupabase();

  const { signMessageAsync } = useSignMessage();
  const { address: userAddress } = useAccount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const checkLoggedIn = useCallback(() => {
    const token = Cookies.get("supabasetoken");
    if (!token) {
      // Prompt the user to log in or sign up.
      setIsLoggedIn(false);
      return false;
    } else {
      // Use Supabase client to set the session:
      const decodedToken = jwtDecode(token);
   

      if (!decodedToken.exp) return false;

      // Check if it's expired
      const currentTime = Date.now() / 1000; // in seconds
      if (decodedToken.exp < currentTime) {
        setIsLoggedIn(false);
        return false;
      } else {
        setIsLoggedIn(true);
        return true;
      }
    }
  }, []);

  const login = async () => {
    if (!isConnected) {
      handleConnectWallet();
    }
    const nonce = await fetch("/api/nonce", {
      method: "POST",
      body: JSON.stringify({
        address: userAddress,
      }),
    }).then((res) => res.json());
    console.log("signMessage.nonce", nonce);
    const signedMessage = await signMessageAsync({ message });

    const token = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        signedMessage,
        nonce: nonce.nonce,
        address: userAddress,
      }),
    }).then((res) => res.json());

    setCookie("supabasetoken", token.token);
    setIsLoggingIn(false);
    setIsLoggedIn(true);
  };

  async function logout() {
    setCookie("supabasetoken", "");
    setIsLoggedIn(false);
    setIsLoggingIn(false);
    setToken("");
    removeCookie("supabasetoken");
  }

  return {
    login,
    logout,
    checkLoggedIn,
    isLoggedIn,
    isLoggingIn,
  };
};
