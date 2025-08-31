const fetch = require("node-fetch");



exports.handler = async (event) => {
  // Add CORS headers to all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Get-Config',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Handle GET requests for API key display
  if (event.httpMethod === 'GET' && event.headers['x-get-config']) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        apiKey: process.env.LOGMEAL_API_KEY || null,
        configured: !!process.env.LOGMEAL_API_KEY
      })
    };
  }

  try {
    console.log("🔑 API Key present:", !!process.env.LOGMEAL_API_KEY);

    const body = JSON.parse(event.body);
    let imageData = body.image || "";

    // Remove data URL prefix if present
    imageData = imageData.replace(/^data:image\/\w+;base64,/, "");

    console.log("➡️ Final image length:", imageData.length);
    console.log("➡️ Starts with:", imageData.substring(0, 30));

    // Convert base64 to buffer and use FormData
    const FormData = require('form-data');
    const imageBuffer = Buffer.from(imageData, 'base64');
    
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });

    console.log("📤 Sending to LogMeal API with API key...");
    console.log("🔑 API Key present:", !!process.env.LOGMEAL_API_KEY);

    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.LOGMEAL_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData,
    });

    console.log("📡 API Response status:", response.status);

    const data = await response.json();
    console.log("📦 Full API Response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("❌ LogMeal API Error:", data);
      
      // Handle specific error cases
      if (response.status === 429) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({ 
            error: "Daily request limit exceeded", 
            message: "Today's request limit has been reached. Please try again tomorrow.",
            details: data 
          }),
        };
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data }),
      };
    }

    // Transform the response to match what the frontend expects
    let detections = [];
    
    // Extract food families as general categories
    if (data.foodFamily && Array.isArray(data.foodFamily)) {
      data.foodFamily.forEach(family => {
        if (family.name && family.name !== '_empty_' && family.prob > 0.5) {
          console.log(`🍽️ Detected food family: ${family.name} (${family.prob})`);
          detections.push({
            name: family.name.replace(/s$/, ''), // Remove plural 's'
            confidence: family.prob,
            type: 'family'
          });
        }
      });
    }

    // If we have segmentation results, use those (more detailed)
    if (data.segmentation_results && Array.isArray(data.segmentation_results)) {
      data.segmentation_results.forEach(segment => {
        if (segment.recognition_results && Array.isArray(segment.recognition_results)) {
          segment.recognition_results.forEach(recognition => {
            if (recognition.name && recognition.prob > 0.3) {
              console.log(`🍽️ Detected ingredient: ${recognition.name} (${recognition.prob})`);
              detections.push({
                name: recognition.name,
                confidence: recognition.prob,
                type: 'ingredient'
              });
            }
          });
        }
      });
    }

    // Create a response format that matches what the frontend expects
    const transformedResponse = {
      segmentation_results: [{
        recognition_results: detections.map(d => ({
          name: d.name,
          prob: d.confidence
        }))
      }]
    };

    console.log("✅ Transformed response:", JSON.stringify(transformedResponse, null, 2));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedResponse),
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
