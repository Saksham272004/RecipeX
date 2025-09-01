const fetch = require("node-fetch");
const FormData = require("form-data");

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

  try {
    const body = JSON.parse(event.body);
    let imageData = body.image || "";
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

    const imageBuffer = Buffer.from(imageData, "base64");
    const formData = new FormData();
    formData.append("image", imageBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LOGMEAL_API_KEY}`,
        "user_token": process.env.LOGMEAL_USER_TOKEN,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal Server Error", details: err.message }),
    };
  }
};
