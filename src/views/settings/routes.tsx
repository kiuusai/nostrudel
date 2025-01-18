import { lazy } from "react";
import { Outlet, RouteObject } from "react-router";
import RequireCurrentAccount from "../../components/router/require-current-account";

import SettingsView from ".";
import DisplaySettings from "./display";
import AccountSettings from "./accounts";
import MailboxesView from "../relays/mailboxes";
import MediaServersView from "./media-servers";
import SearchRelaysView from "../relays/search";
import AppRelaysView from "../relays/app";
import CacheRelayView from "../relays/cache";
import PostSettings from "./post";
import PrivacySettings from "./privacy";
import LightningSettings from "./lightning";
import PerformanceSettings from "./performance";

// bakery settings
const BakeryConnectView = lazy(() => import("./bakery/connect"));
const RequireBakery = lazy(() => import("../../components/router/require-bakery"));
const BakeryGeneralSettingsView = lazy(() => import("./bakery/general-settings"));
const BakeryAuthView = lazy(() => import("./bakery/connect/auth"));
const NotificationSettingsView = lazy(() => import("./bakery/notifications"));
const RequireBakeryAuth = lazy(() => import("../../components/router/require-bakery-auth"));
const BakeryNetworkSettingsView = lazy(() => import("./bakery/network"));
const BakeryServiceLogsView = lazy(() => import("./bakery/service-logs"));

export default [
  {
    element: <SettingsView />,
    children: [
      { index: true, Component: DisplaySettings },
      { path: "display", Component: DisplaySettings },
      {
        path: "accounts",
        element: (
          <RequireCurrentAccount>
            <AccountSettings />
          </RequireCurrentAccount>
        ),
      },
      { path: "mailboxes", Component: MailboxesView },
      { path: "media-servers", Component: MediaServersView },
      { path: "search-relays", Component: SearchRelaysView },
      { path: "relays", Component: AppRelaysView },
      { path: "cache", Component: CacheRelayView },
      { path: "post", Component: PostSettings },
      { path: "privacy", Component: PrivacySettings },
      { path: "lightning", Component: LightningSettings },
      { path: "performance", Component: PerformanceSettings },

      { path: "bakery/connect", Component: BakeryConnectView },
      {
        path: "bakery",
        element: (
          <RequireBakery>
            <Outlet />
          </RequireBakery>
        ),
        children: [
          { index: true, Component: BakeryGeneralSettingsView },
          { path: "auth", Component: BakeryAuthView },
          { path: "notifications", Component: NotificationSettingsView },
          {
            path: "network",
            element: (
              <RequireBakeryAuth>
                <BakeryNetworkSettingsView />
              </RequireBakeryAuth>
            ),
          },
          { path: "logs", Component: BakeryServiceLogsView },
        ],
      },
    ],
  },
] satisfies RouteObject[];
