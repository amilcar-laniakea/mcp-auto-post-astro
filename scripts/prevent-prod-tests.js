import dotenv from "dotenv";
dotenv.config();

function preventProductionTests() {
  // Check for production environments
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "❌ Tests are disabled in production environment"
    );
    console.error(
      "\x1b[33m%s\x1b[0m",
      "⚠️  This is a security measure to prevent test execution in production"
    );
    process.exit(1);
  }
}

console.log("Running production test prevention script...");

preventProductionTests();
