import { PropsWithChildren, ReactNode, Suspense } from "react";
import { Outlet, OutletProps, useMatch } from "react-router-dom";
import { Flex, FlexProps, Spinner } from "@chakra-ui/react";

import { useBreakpointValue } from "../../../providers/global/breakpoint-provider";
import SimpleHeader from "./simple-header";
import { ErrorBoundary } from "../../error-boundary";

export default function SimpleParentView({
  children,
  path,
  title,
  width = "xs",
  actions,
  padding = true,
  scroll = true,
  gap = 2,
  context,
}: PropsWithChildren<{
  path: string;
  title?: string;
  width?: "xs" | "sm" | "md";
  actions?: ReactNode;
  padding?: boolean;
  scroll?: boolean;
  gap?: FlexProps["gap"];
  context?: OutletProps["context"];
}>) {
  const match = useMatch(path);
  const isMobile = useBreakpointValue({ base: true, lg: false });
  const showMenu = !isMobile || !!match;

  return (
    <Flex data-type="contained-view" h="full" overflow="hidden" direction={{ base: "column", lg: "row" }}>
      {showMenu && (
        <Flex w={{ base: "full", lg: width }} direction="column" overflow="hidden" h="full" flexShrink={0}>
          {title && <SimpleHeader title={title}>{actions}</SimpleHeader>}
          {scroll ? (
            <Flex
              direction="column"
              p={padding ? "2" : undefined}
              gap={gap}
              overflowY={scroll ? "auto" : "hidden"}
              overflowX="hidden"
              flex={1}
            >
              {children}
            </Flex>
          ) : (
            <>{children}</>
          )}
        </Flex>
      )}
      {(!isMobile || !showMenu) && (
        <Suspense fallback={<Spinner />}>
          <ErrorBoundary>
            <Outlet context={context} />
          </ErrorBoundary>
        </Suspense>
      )}
    </Flex>
  );
}
