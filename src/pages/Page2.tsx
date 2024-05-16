import { useLocation } from "react-router-dom";

type LocationState = {
  id: number;
  name: string;
};
export default function Page2() {
  const location = useLocation();

  // Kontrola, či má location.state definovaný typ LocationState
  const myState: LocationState | null = location.state;

  return (
    <div>
      <h1>Page 2</h1>
      {myState && (
        <div>
          <div>IDD: {myState.id}</div>
          <div>Name: {myState.name}</div>
        </div>
      )}
    </div>
  );
}
