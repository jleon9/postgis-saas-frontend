import { getKongTokens } from "@/app/actions/auth/getKongTokens";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// lib/apollo-server.ts
export async function createServerClient(url?: string) {
  const httpLink = createHttpLink({
    uri: process.env.DGRAPH_URL ?? url,
    fetchOptions: {
      mode: "cors",
    },
  });

  const authLink = setContext(async (_, { headers }) => {
    try {
      let tokens = await getKongTokens(url);
      console.log("KONG_TOKENS", tokens);
      if (!tokens?.accessToken) {
        tokens = await getKongTokens(url);
      }
      return {
        headers: {
          ...headers,
          Authorization: tokens?.accessToken
            ? `Bearer ${tokens.accessToken}`
            : "",
        },
      };
    } catch (error) {
      console.error("Auth link error:", error);
      return { headers };
    }
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      addTypename: false,
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
      query: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
      mutate: {
        fetchPolicy: "no-cache",
        errorPolicy: "all",
      },
    },
  });
}
