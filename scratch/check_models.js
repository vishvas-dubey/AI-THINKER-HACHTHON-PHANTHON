const key = "AIzaSyDJAanb2BXJym8Jz9j4JYxHER7NjP_68kI";

async function listModels() {
  try {
    console.log("Checking API key...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log("Error or no models found:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
