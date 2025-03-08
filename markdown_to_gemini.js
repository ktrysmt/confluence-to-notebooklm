function markdownToGemini() {
  // Geminiの設定 (実際の値に置き換えてください)
  const GEMINI_API_URL = "https://gemini.example.com/v1/import";
  const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";
  const INPUT_DIR = "markdown_files"; // Google Driveのフォルダ名

  function readMarkdownFiles() {
    const documents = [];
    // Google Driveのフォルダを取得
    let folder = DriveApp.getRootFolder().getFoldersByName(INPUT_DIR);
    if (folder.hasNext()) {
      folder = folder.next();
    } else {
      Logger.log("Markdownファイルが見つかりませんでした。");
      return [];
    }

    const files = folder.getFilesByType(MimeType.PLAIN_TEXT);
    while (files.hasNext()) {
      const file = files.next();
      if (file.getName().endsWith(".md")) {
        const content = file.getBlob().getDataAsString();
        const title = content.split("
")[0].replace("# ", "");
        documents.push({
          "title": title,
          "content": content,
          "metadata": { "source": "Confluence" }
        });
      }
    }
    return documents;
  }

  function sendToGemini(documents) {
    const headers = {
      "Authorization": `Bearer ${GEMINI_API_KEY}`,
      "Content-Type": "application/json"
    };
    const options = {
      "method": "post",
      "headers": headers,
      "payload": JSON.stringify({ "documents": documents }),
      "muteHttpExceptions": true
    };
    const response = UrlFetchApp.fetch(GEMINI_API_URL, options);
    if (response.getResponseCode() !== 200) {
      Logger.log(`Error sending to Gemini: ${response.getContentText()}`);
      return null;
    }
    return JSON.parse(response.getContentText());
  }

  // スクリプトの実行
  const documents = readMarkdownFiles();
  if (documents.length > 0) {
    const result = sendToGemini(documents);
    Logger.log("Geminiへの送信結果:", result);
  } else {
    Logger.log("Markdownファイルが見つかりませんでした。");
  }
}
