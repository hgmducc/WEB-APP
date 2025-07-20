// hooks/submitReadingResult.js
export async function submitReadingResult(quizResults) {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwFYOq6KHukwE_rr-NNFWthfX00SpvQiGOA4heENPnjC_ixU3ZW8ugFmSBcfgB9AH0PzQ/exec"; // Thay bằng URL của bạn

  const payload = {
    type: "reading",
    data: quizResults
  };

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      mode: "no-cors", // Giúp gửi được đến Apps Script, nếu cần CORS bạn chỉnh trong Script
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Kết quả đã gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi kết quả:", error);
  }
}
