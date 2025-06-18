import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "./App.css"

import { AppContextProvider } from './context/AppContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppContextProvider> 
      <App />
    </AppContextProvider>
  </React.StrictMode>
);
