import type { Request } from "express";

export const getClientIp = (req: Request): string => {
  let ip = req.ip || req.socket?.remoteAddress || "";
  
  // Clean up IPv4 mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  } else if (ip === "::1") {
    ip = "127.0.0.1";
  }
  
  return ip;
};
