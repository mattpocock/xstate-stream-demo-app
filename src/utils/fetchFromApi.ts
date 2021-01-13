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
    .then((res) => res.data);
};
