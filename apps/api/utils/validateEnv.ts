export function validateEnv() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing environment variable: JWT_SECRET");
  }
}
