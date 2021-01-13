import * as n from "@nexus/schema";

export const User = n.objectType({
  name: "User",
  definition(t) {
    t.string("username");
    t.string("firstName");
    t.string("lastName");
  },
});

export const getUser = n.queryField("user", {
  type: "User",
  resolve() {
    return {
      username: "mattpocock",
      firstName: "Matt",
      lastName: "Pocock",
    };
  },
});

export const logIn = n.mutationField("logIn", {
  type: "User",
  args: {
    username: n.stringArg(),
    password: n.stringArg(),
  },
  resolve() {
    return {
      username: "mattpocock",
      firstName: "Matt",
      lastName: "Pocock",
    };
  },
});
