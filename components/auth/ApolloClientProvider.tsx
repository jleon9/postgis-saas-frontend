"use client";
import { ApolloClient, ApolloProvider } from "@apollo/client";
import { useEffect, useState } from "react";
import Loading from "../loader/Loading";
import { createServerClient } from "@/lib/auth/apollo-server";

export function ApolloClientProvider({
  children,
  dbUrl // Pass this from your root layout or page
}: {
  children: React.ReactNode;
  dbUrl: string;
}) {
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  useEffect(() => {
    async function initClient() {
      try {
        const serverClient = await createServerClient(dbUrl);
        setClient(serverClient);
      } catch (error) {
        console.error("Failed to initialize Apollo client:", error);
      }
    }

    initClient();
  }, [dbUrl]);

  if (!client) {
    return <Loading />;
  }

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}