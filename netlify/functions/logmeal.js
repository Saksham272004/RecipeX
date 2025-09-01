const fetch = require("node-fetch");
const FormData = require("form-data");

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, X-Get-Config",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  // Handle GET → used by app.js to check if API is configured
  if (event.httpMethod === "GET" && event.headers["x-get-config"]) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        apiKey: process.env.LOGMEAL_API_KEY ? "Present" : null,
        userToken: process.env.LOGMEAL_USER_TOKEN ? "Present" : null,
        configured: !!process.env.LOGMEAL_API_KEY && !!process.env.LOGMEAL_USER_TOKEN,
      }),
    };
  }

  try {
    if (!process.env.LOGMEAL_API_KEY || !process.env.LOGMEAL_USER_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Missing API configuration" }),
      };
    }

    const body = JSON.parse(event.body);
    let imageData = body.image || "";

    // Strip "data:image..." if present
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

    const imageBuffer = Buffer.from(imageData, "base64");

    const formData = new FormData();
    formData.append("image", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    console.log("📤 Sending image to LogMeal...");
    console.log("🔑 API Key exists:", !!process.env.LOGMEAL_API_KEY);
    console.log("🎫 User Token exists:", !!process.env.LOGMEAL_USER_TOKEN);

    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LOGMEAL_API_KEY}`,
        user_token: process.env.LOGMEAL_USER_TOKEN,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();
    console.log("📦 LogMeal response:", JSON.stringify(data, null, 2));

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("❌ Function error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error", details: err.message }),
    };
  }
};
