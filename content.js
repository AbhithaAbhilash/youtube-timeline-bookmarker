chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_TIME") {
    const video = document.querySelector("video");
    if (video) {
      sendResponse({
        time: Math.floor(video.currentTime)
      });
    }
  }
});
