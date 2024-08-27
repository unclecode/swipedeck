import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css"; 

import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

// Prevent pull-to-refresh
let startY;

document.addEventListener('touchstart', (e) => {
  startY = e.touches[0].pageY;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
  const y = e.touches[0].pageY;
  const direction = y > startY ? 'down' : 'up';
  const scrollTop = document.documentElement.scrollTop;
  
  // Prevent pull-to-refresh only when scrolling down at the top of the page
  if (direction === 'down' && scrollTop <= 0) {
    e.preventDefault();
  }
}, { passive: false });

// Prevent bounce in iOS when scrolling beyond content
document.body.addEventListener('touchmove', (e) => {
  if (e.target === document.body) {
    e.preventDefault();
  }
}, { passive: false });

root.render(
//   <StrictMode>
    <App />
//   </StrictMode>
);