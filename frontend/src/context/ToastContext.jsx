import { createContext, useContext, useState, useCallback } from "react";
import { IoCheckmarkOutline, IoCloseOutline, IoInformationCircleOutline } from "react-icons/io5";

const ToastCtx = createContext(null);

export const useToast = () => useContext(ToastCtx);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg, type = "ok") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const icons = { ok: <IoCheckmarkOutline size={16} />, err: <IoCloseOutline size={16} />, info: <IoInformationCircleOutline size={16} /> };

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span
              style={{
                color:
                  t.type === "ok"
                    ? "var(--emerald)"
                    : t.type === "err"
                    ? "var(--rose)"
                    : "var(--gold)",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {icons[t.type]}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};
