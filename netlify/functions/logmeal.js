const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Get-Config",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // For API status check
  if (event.httpMethod === "GET" && event.headers["x-get-config"]) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        apiKey: !!process.env.LOGMEAL_API_KEY,
        userToken: !!process.env.LOGMEAL_USER_TOKEN,
        configured: !!(process.env.LOGMEAL_API_KEY && process.env.LOGMEAL_USER_TOKEN),
      }),
    };
  }

  try {
    console.log("🔑 API Key present:", !!process.env.LOGMEAL_API_KEY);
    console.log("🎫 User Token present:", !!process.env.LOGMEAL_USER_TOKEN);

    if (!process.env.LOGMEAL_API_KEY || !process.env.LOGMEAL_USER_TOKEN) {
      throw new Error("Missing API key or user token in environment variables");
    }

    const body = JSON.parse(event.body);
    let imageData = body.image || "";

    // Remove data URL prefix if present
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

    console.log("➡️ Final image length:", imageData.length);

    // Prepare form data
    const imageBuffer = Buffer.from(imageData, "base64");
    const formData = new FormData();
    formData.append("image", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    console.log("📤 Sending to LogMeal API...");

    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LOGMEAL_API_KEY}`,
        "user_token": process.env.LOGMEAL_USER_TOKEN,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    console.log("📡 API Response status:", response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ LogMeal API Error:", data);
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
