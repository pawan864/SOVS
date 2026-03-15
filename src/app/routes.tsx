import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { AdminDashboard } from "./components/dashboards/AdminDashboard";
import { DMDashboard } from "./components/dashboards/DMDashboard";
import { SDMDashboard } from "./components/dashboards/SDMDashboard";
import { CDODashboard } from "./components/dashboards/CDODashboard";
import { VoterDashboard } from "./components/dashboards/VoterDashboard";
import { Elections } from "./components/Elections";
import { Vote } from "./components/Vote";
import { Results } from "./components/Results";
import { AdminPanel } from "./components/AdminPanel";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },

      { path: "dashboard", Component: Dashboard },

      { path: "voter-dashboard", Component: VoterDashboard },

      { path: "admin-dashboard", Component: AdminDashboard },

      { path: "dm-dashboard", Component: DMDashboard },

      { path: "sdm-dashboard", Component: SDMDashboard },

      { path: "cdo-dashboard", Component: CDODashboard },

      { path: "elections", Component: Elections },

      { path: "vote/:electionId", Component: Vote },

      { path: "results/:electionId", Component: Results },

      { path: "admin", Component: AdminPanel },

      { path: "*", Component: NotFound },
    ],
  },
]);
