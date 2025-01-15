import { Flex, FlexProps } from "@chakra-ui/react";

import SimpleHeader from "./simple-header";
import { ReactNode } from "react";

export default function SimpleView({
  children,
  actions,
  title,
  as,
  flush,
  gap,
  ...props
}: FlexProps & { flush?: boolean; actions?: ReactNode }) {
  return (
    <Flex as={as} flex={1} direction="column" overflow="hidden" pr="var(--safe-right)" pl="var(--safe-left)" {...props}>
      <SimpleHeader title={title}>{actions}</SimpleHeader>

      <Flex
        direction="column"
        overflowY="auto"
        px={flush ? 0 : "4"}
        pt={flush ? 0 : "4"}
        pb={flush ? 0 : "max(1rem, var(--safe-bottom))"}
        gap={gap || "2"}
        flexGrow={1}
      >
        {children}
      </Flex>
    </Flex>
  );
}
