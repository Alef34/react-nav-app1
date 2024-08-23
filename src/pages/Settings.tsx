import { useNavigate } from "react-router-dom";

const localData = {
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get(key: string) {
    const stored = localStorage.getItem(key);
    console.log(
      "getisko " + key + ": ",
      stored == null ? undefined : JSON.parse(stored)
    );
    return stored == null ? undefined : JSON.parse(stored);
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export const Modal = () => {
  const navigate = useNavigate();
  return (
    <div className="modalDiv">
      <div className="modal">
        <h3>Nastavenia</h3>
        <button
          onClick={() => {
            localData.set("showAkordy", false);
            navigate(-1);
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};
