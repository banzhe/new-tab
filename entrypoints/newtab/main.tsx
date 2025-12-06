import React from "react"
import ReactDOM from "react-dom/client"
import "@/assets/tailwind.css"
import App from "./App.tsx"

// biome-ignore lint/style/noNonNullAssertion: root is guaranteed to be in the document
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
