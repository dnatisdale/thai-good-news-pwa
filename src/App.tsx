import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UpdateToast from '@/components/UpdateToast';
import Toast from '@/components/Toast';

import Home from '@/routes/Home';
import AddLink from '@/routes/AddLink';
import Favorites from '@/routes/Favorites';
import Settings from '@/routes/Settings';
import About from '@/routes/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddLink />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
        <UpdateToast />
        <Toast />
      </div>
    </BrowserRouter>
  );
}
