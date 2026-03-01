// ToastAlert.tsx
/*export const ToastAlert: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Escuchar el evento desde Phaser
    const showToast = (msg: string) => {
      setMessage(msg);
      setTimeout(() => setMessage(null), 2000);
    };

    // Necesitarás una referencia global o evento de window
    window.addEventListener("show-toast", (e: any) => showToast(e.detail));
    return () => window.removeEventListener("show-toast", showToast);
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200]">
      <div className="bg-black/80 border-2 border-white p-2 rounded-md">
        <span className="text-white font-pixel text-sm">{message}</span>
      </div>
    </div>
  );
};*/
