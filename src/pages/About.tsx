import { useLocation } from "react-router-dom";

type Song = {
  cisloP: string;
  nazov: string;
};
export default function About() {
  const location = useLocation();

  // Kontrola, či má location.state definovaný typ LocationState
  const myState: Song | null = location.state;

  return (
    <div>
      <h1>Page 222</h1>
      {myState && (
        <div>
          <div>IDD: {myState.cisloP}</div>
          <div>Name: {myState.nazov}</div>
        </div>
      )}
    </div>
  );
}
