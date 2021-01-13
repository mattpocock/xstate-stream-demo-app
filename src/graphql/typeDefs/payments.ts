import * as n from "@nexus/schema";

export const payment = n.objectType({
  name: "Payment",
  definition(t) {
    t.id("id");
    t.string("currency");
    t.float("amount");
    t.string("date");
    t.string("reason");
    t.string("reference");
  },
});

export const createPayment = n.mutationField("createPayment", {
  type: "Payment",
  args: {
    currency: n.stringArg(),
    amount: n.floatArg(),
    date: n.stringArg(),
    reason: n.stringArg(),
    reference: n.stringArg(),
  },
  resolve(root, args) {
    return {
      ...args,
      id: "id",
    };
  },
});

export const validatePayment = n.mutationField("validatePayment", {
  type: "Boolean",
  args: {
    currency: n.stringArg(),
    amount: n.floatArg(),
    date: n.stringArg(),
    reason: n.stringArg(),
    reference: n.stringArg(),
  },
  resolve(root) {
    return true;
  },
});

export const getPayment = n.queryField("payment", {
  type: "Payment",
  args: {
    id: n.stringArg(),
  },
  resolve(root, args) {
    return {
      id: args.id,
      currency: "GBP",
      amount: 20,
      date: "2018-04-02",
      reason: "Gift",
      reference: "REFERENCE",
    };
  },
});
