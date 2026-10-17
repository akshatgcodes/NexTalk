import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Static HTML export, served at "/" by server.js next to the chat app.
  output: "export",
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
