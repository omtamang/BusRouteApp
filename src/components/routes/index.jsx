import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useAuth } from "../security/AuthProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import Landing from "../LandingPage/Landing";
import Basicmap from "../Basicmap";
import Sign from "../Register/Sign";
import Login from "../Login/Login";
import Logout from "../Logout/Logout";
import Profile from "../ProfileAndSettings/Profile";
import GoogleLoginHandling from "../GoogleLoginHandling/GoogleLoginHandling";

const Routes = () => {
    const { token } = useAuth();

    const routesForPublic = [
        {
          path: "/",
          element: <Landing/>,
        },
        {
          path: "/google/handling/:email",
          element: <GoogleLoginHandling/>,
        },
      ];

      const routesForAuthenticatedOnly = [
        {
          path: "/",
          element: <ProtectedRoute/>,
          children: [
            {
              path: "/map",
              element: <Basicmap/>,
            },
            {
                path: "/logout",
                element: <Logout/>,
            },
            {
                path: "/profile",
                element: <Profile/>,
            }
          ],
        },
      ];

      const routesForNotAuthenticatedOnly = [
        {
          path: "/signup",
          element: <Sign/>,
        },
        {
          path: "/login",
          element: <Login/>,
        },
      ];
      
      const router = createBrowserRouter([
        ...routesForPublic,
        ...(!token ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticatedOnly,
      ]);
      
      return <RouterProvider router={router} />;
  };

  export default Routes;
  