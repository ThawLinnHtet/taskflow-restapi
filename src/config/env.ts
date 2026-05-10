type Config = {
  env: "development" | "production" | "test";
  port: number;
};

const port = Number(process.env.PORT || 3000);

if (isNaN(port)) {
  throw new Error("Invalid PORT environment variable");
}

const config: Config = {
  env: (process.env.NODE_ENV as Config["env"]) || "development",
  port,
};

export default config;