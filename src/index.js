# Create src/index.js
echo 'import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register();' > src/index.js

# Create src/App.js (basic version)
echo 'import React from "react";
import { Search, Plus } from "lucide-react";
import "./App.css";

function App() {
  return (
    <div className="App">
      <h1>ข่าวดี Thai: Good News</h1>
    </div>
  );
}

export default App;' > src/App.js

# Create empty CSS files
touch src/index.css src/App.css