export const jsonSafe = (data: unknown, init?: ResponseInit) => {
  return Response.json(JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))), init);
};

export const serializeBigInt = <T>(data: T): T => {
  return JSON.parse(JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v)));
};
