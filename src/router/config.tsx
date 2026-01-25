import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AnciValidation from "../pages/anci/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/anci",
    element: <AnciValidation />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
