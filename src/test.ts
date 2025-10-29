import dotenv from "dotenv";

dotenv.config();

const API_URL = `http://localhost:${process.env.MCP_PORT || 3000}`;
const API_KEY = process.env.API_SECRET_KEY;

async function testAPI() {
  console.log("🧪 Testing MCP API...\n");

  // Test 1: Health check
  console.log("1️⃣ Testing health endpoint...");
  try {
    const healthRes = await fetch(`${API_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log("✅ Health check:", healthData);
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return;
  }

  // Test 2: Validate GitHub access
  console.log("\n2️⃣ Validating GitHub access...");
  try {
    const validateRes = await fetch(`${API_URL}/api/validate`, {
      headers: {
        "x-api-key": API_KEY!,
      },
    });
    const validateData = await validateRes.json();
    console.log("✅ GitHub validation:", validateData);
  } catch (error) {
    console.error("❌ GitHub validation failed:", error);
    return;
  }

  // Test 3: Create a post
  console.log("\n3️⃣ Creating a test post...");
  try {
    const testPost = {
      title: "My first post with MCP",
      description: "This is a post created via the MCP API",
      tags: ["automation", "mcp"],
      category: "MCP",
      draft: true,
      content: `
## Introduction

This is a test post created automatically through the MCP server.

## Features

- Automated post creation
- GitHub integration
- Vercel deployment trigger

## Conclusion

The MCP is working correctly!
      `.trim(),
    };

    const createRes = await fetch(`${API_URL}/api/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY!,
      },
      body: JSON.stringify(testPost),
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      console.error("❌ Failed to create post:", error);
      return;
    }

    type CreatePostResponse = {
      data?: {
        path?: string;
        commitUrl?: string;
      };
      [key: string]: any;
    };

    const createData = (await createRes.json()) as CreatePostResponse;
    console.log("✅ Post created successfully:", createData);
    console.log("📝 File:", createData.data?.path);
    console.log("🔗 Commit:", createData.data?.commitUrl);
  } catch (error) {
    console.error("❌ Post creation failed:", error);
  }

  console.log("\n✨ All tests completed!");
}

testAPI().catch(console.error);
