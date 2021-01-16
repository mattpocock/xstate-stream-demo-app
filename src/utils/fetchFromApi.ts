import { print, DocumentNode } from "graphql";

export const fetchFromApi = (query: DocumentNode, variables: {}) => {
  return fetch("/api/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: print(query),
      variables,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.errors?.[0]?.message) {
        throw new Error(res?.errors?.[0]?.message);
      }
      return res.data;
    });
};
