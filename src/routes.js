// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import Billing from "layouts/billing";
import RTL from "layouts/rtl";
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";
import ImportantDates from "layouts/profile/importantDates";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  // {
  //   type: "collapse",
  //   name: "Results",
  //   key: "results",
  //   icon: <Icon fontSize="small">table_view</Icon>,
  //   route: "/tables",
  //   component: <Tables />,
  // },
  {
    type: "collapse",
    name: "Academic Calenders",
    key: "academicCalenders",
    icon: <Icon fontSize="small">folder-17</Icon>,
    route: "/academicCalenders",
    component: <Notifications />,
  },
  {
    type: "collapse",
    name: "Achievements",
    key: "achivements",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/achivements",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Important Dates",
    key: "important-dates",
    icon: <Icon fontSize="small">pinch</Icon>,
    route: "/important-dates",
    component: <ImportantDates />,
  },
  {
    type: "collapse",
    name: "Sign Out",
    key: "sign-in",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
