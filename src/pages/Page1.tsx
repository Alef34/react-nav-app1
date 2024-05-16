import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type LocationState = {
  id: number;
  name: string;
};

export default function Page1() {
  const navigate = useNavigate();
  const routeState: LocationState = {
    id: 22,
    name: "JJ",
  };

  return (
    <div>
      <h1>React Router Demo</h1>
      <button
        onClick={() => {
          navigate("/page2", { state: routeState });
        }}
      >
        Next Page
      </button>
      <br />
      {/* <Link to="/page2" state={routeState}>
        Page2
      </Link>*/}
    </div>
  );
}
