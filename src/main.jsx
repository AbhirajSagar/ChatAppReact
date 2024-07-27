import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

import './assets/stylesheets/main.css';

import Home from './Home.jsx';
import SignIn from './SignIn.jsx';
import ChatSetup from './ChatSetup.jsx';
import VideoTextChat from './VideoTextChat.jsx';

const firebaseConfig = 
{
  apiKey: "AIzaSyCCN46M-SToHAzDXk-jDu0hy0avhikrm6E",
  authDomain: "chatapp-c0e12.firebaseapp.com",
  projectId: "chatapp-c0e12",
  storageBucket: "chatapp-c0e12.appspot.com",
  messagingSenderId: "1036683268005",
  appId: "1:1036683268005:web:fc8e4c5457a4bb649d624c",
  measurementId: "G-6828LZG9PB"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);

function AuthBasedRender()
{
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  useEffect(() => 
  {
    
    const unsubscribe = onAuthStateChanged(auth, (user) => 
    {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router> 
      <Routes> 
        <Route path="/" element={isLoggedIn ? <ChatSetup /> : <SignIn />} /> 
        <Route path="/setup" element={<ChatSetup/>} /> 
        <Route path="/auth" element={<SignIn />} /> 
        <Route path="/video-text-chat" element={<VideoTextChat />} /> 
      </Routes> 
    </Router> 
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthBasedRender/>
  </React.StrictMode>
);
