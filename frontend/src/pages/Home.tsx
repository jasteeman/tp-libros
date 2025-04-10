import React from "react";
import Loader from "../components/Loader"; 

export const Home = () => {
  const [loading] = React.useState(false);

  if (loading) {
    return <Loader />;
  }

  return <><div>Home</div></>;
};
