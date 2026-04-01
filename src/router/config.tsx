import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AnciValidation from "../pages/anci/page";
import RegistrationPage from "../pages/checkout/page";
import RegistrationSuccessPage from "../pages/checkout-success/page";
import RegistrationExpiredPage from "../pages/checkout-expired/page";

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
    path: "/checkout",
    element: <RegistrationPage />,
  },
  {
    path: "/checkout/sucesso",
    element: <RegistrationSuccessPage />,
  },
  {
    path: "/checkout/expirado",
    element: <RegistrationExpiredPage />,
  },
  {
    path: "/checkout/:orderId",
    element: <RegistrationPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
