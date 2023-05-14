import type { V2_MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import * as React from "react";
import { ethers } from "ethers";
import { authenticate, challenge, client } from "~/lib/lens-graphql-api";
import safeTransaction from "~/lib/safe-protocol.server";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const meta: V2_MetaFunction = () => [{ title: "Clarity" }];

export async function action() {
  await safeTransaction();
  return redirect(`/login`);
}

export default function Index() {
  const [address, setAddress] = React.useState<string | undefined>();
  const [token, setToken] = React.useState<string | undefined>();
  const checkConnection = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    if (accounts.length) {
      setAddress(accounts[0]);
    }
  };

  const connect = async () => {
    const { ethereum } = window;
    if (ethereum == null) {
      alert("You should install wallet first");
    }
    /* this allows the user to connect their wallet */
    const account = await window.ethereum.send("eth_requestAccounts");
    if (account.result.length) {
      setAddress(account.result[0]);
    }
  };
  React.useEffect(() => {
    /* when the app loads, check to see if the user has already connected their wallet */
    checkConnection();
  }, []);

  const login = async () => {
    try {
      /* first request the challenge from the API server */
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address },
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      /* ask the user to sign a message with the challenge info returned from the server */
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      /* authenticate the user */
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address,
          signature,
        },
      });
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;
      setToken(accessToken);
    } catch (err) {
      const { message } = err as any;
      alert(`Error signing in: ${message} `);
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex h-[668px] w-[460px] flex-col items-center justify-center bg-[#f2e6f7]">
        {!address && (
          <button
            onClick={connect}
            className="h-10 w-[240px] rounded-sm bg-slate-950 leading-[32px] text-white hover:cursor-pointer"
          >
            Connect with MetaMask
          </button>
        )}
        {address && !token && (
          <div onClick={login}>
            <button className="h-10 w-[240px] rounded-sm bg-slate-950 leading-[32px] text-white hover:cursor-pointer">
              Sign in with Lens
            </button>
          </div>
        )}
        {address && token && (
          <>
            <h2 className="font-grotesk text-2xl font-semibold text-black">
              You have now signed in with Lens
            </h2>
            <form method="post">
              <button
                type="submit"
                className="h-10 w-[240px] rounded-sm bg-slate-950 leading-[32px] text-white hover:cursor-pointer"
              >
                Get some network tokens
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
