const fetch = require("node-fetch");
const FormData = require("form-data");

// Helper: create new APIUser if none exists
async function createUserToken(apiKey) {
  console.log("🆕 Creating new APIUser...");
  const response = await fetch("https://api.logmeal.es/v2/user/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      age: 25,
      weight: 70,
      height: 170,
      sex: "male",
      activity: "sedentary",
      objective: "maintain",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Failed to create APIUser:", errorText);
    throw new Error(`User creation failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("✅ APIUser created:", data.user_token);
  return data.user_token;
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Get-Config",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod === "GET" && event.headers["x-get-config"]) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        apiKey: process.env.LOGMEAL_API_KEY || null,
        userToken: process.env.LOGMEAL_USER_TOKEN || null,
        configured: !!process.env.LOGMEAL_API_KEY,
      }),
    };
  }

  try {
    console.log("🔑 API Key present:", !!process.env.LOGMEAL_API_KEY);

    const body = JSON.parse(event.body);
    let imageData = body.image || "";
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

    console.log("➡️ Final image length:", imageData.length);

    // Make sure we have an APIUser token
    let userToken = process.env.LOGMEAL_USER_TOKEN;
    if (!userToken) {
      console.log("⚠️ No LOGMEAL_USER_TOKEN set, creating one...");
      userToken = await createUserToken(process.env.LOGMEAL_API_KEY);
    }

    // Prepare form data
    const imageBuffer = Buffer.from(imageData, "base64");
    const formData = new FormData();
    formData.append("image", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    // Call LogMeal segmentation
    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LOGMEAL_API_KEY}`,
        "user_token": userToken,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log("📡 API Response status:", response.status);
    const data = await response.json();
    console.log("📦 API Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("❌ Function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal Server Error",
        details: err.message,
      }),
    };
  }
};
