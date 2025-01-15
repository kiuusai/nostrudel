import { useCallback, useState } from "react";
import { Button, Image, useToast } from "@chakra-ui/react";
import { AppInfo } from "nostr-signer-capacitor-plugin";
import { useAsync } from "react-use";

import accountService from "../../services/account";
import AndroidSignerAccount from "../../classes/accounts/android-signer-account";
import AndroidNativeSigner from "../../classes/signers/android-native-signer";

function AndroidNativeSignerButton({ app }: { app: AppInfo }) {
  const toast = useToast();
  const [connecting, setConnecting] = useState(false);
  const connect = useCallback(async () => {
    setConnecting(true);

    try {
      const account = await AndroidSignerAccount.fromApp(app);
      accountService.addAccount(account);
      accountService.switchAccount(account.pubkey);
    } catch (error) {
      if (error instanceof Error) toast({ status: "error", description: error.message });
    }

    setConnecting(false);
  }, []);

  return (
    <Button flexDirection="column" h="auto" w="32" p="4" onClick={connect} variant="outline" isLoading={connecting}>
      {app.iconUrl && <Image w={12} src={app.iconUrl} />}
      {app.name}
    </Button>
  );
}

export function AndroidNativeSigners() {
  const { value: apps } = useAsync(() => AndroidNativeSigner.getSignerApps());

  if (!apps) return null;

  return (
    <>
      {apps.map((app) => (
        <AndroidNativeSignerButton key={app.packageName} app={app} />
      ))}
    </>
  );
}
