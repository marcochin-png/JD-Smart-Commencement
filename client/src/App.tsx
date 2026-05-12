import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Chat from './pages/Chat';
import AppointmentSuccess from './pages/AppointmentSuccess';
import ELodgmentPortal from './pages/ELodgmentPortal';
import AppointmentBooking from './pages/AppointmentBooking';
import NotFound from './pages/NotFound';

function App() {
  const [location, setLocation] = useState(window.location.pathname + window.location.search);

  const handleStartChat = (role: 'claimant' | 'defendant', language: 'zh' | 'en' = 'zh') => {
    const params = new URLSearchParams();
    params.set('lang', language);
    params.set('role', role);
    window.history.pushState({}, '', `/chat?${params.toString()}`);
    setLocation(window.location.pathname + window.location.search);
  };

  useEffect(() => {
    const onPop = () => setLocation(window.location.pathname + window.location.search);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const content = (() => {
    const pathname = location.split('?')[0];
    if (pathname === '/' || pathname === '') return <Home onStartChat={handleStartChat} />;
    if (pathname.startsWith('/chat')) return <Chat />;
    if (pathname.startsWith('/appointment-success')) return <AppointmentSuccess />;
    if (pathname.startsWith('/elodgment')) return <ELodgmentPortal />;
    if (pathname.startsWith('/appointment-booking')) return <AppointmentBooking />;
    return <NotFound />;
  })();

  return (
    <>
      {content}
    </>
  );
}

export default App;
