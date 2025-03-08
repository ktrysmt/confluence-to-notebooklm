function confluenceToMarkdown() {
  // Confluenceの設定 (実際の値に置き換えてください)
  const CONFLUENCE_URL = "https://your-confluence-domain.atlassian.net";
  const SPACE_KEY = "YOUR_SPACE_KEY";
  const API_TOKEN = "YOUR_API_TOKEN";
  const OUTPUT_DIR = "markdown_files"; // Google Driveのフォルダ名
  const ROOT_PAGE_ID = "123456789";

  function getPageContent(pageId) {
    const url = `${CONFLUENCE_URL}/rest/api/content/${pageId}?expand=body.storage`;
    const headers = {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json"
    };
    const options = {
      "method": "get",
      "headers": headers,
      "muteHttpExceptions": true  // エラーをスローしない
    };
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() !== 200) {
      Logger.log(`Error fetching page ${pageId}: ${response.getContentText()}`);
      return null;
    }
    return JSON.parse(response.getContentText());
  }

  function convertHtmlToMarkdown(htmlContent) {
    // 簡易的な変換 (必要に応じてhtml2text相当の処理を追加)
    // Google Apps ScriptにはDOMParserがないため、正規表現などで簡易的に処理
    let text = htmlContent.replace(/<br\s*[\/]?>/gi, "
"); // <br> を改行に
    text = text.replace(/<[^>]*>/g, ""); // タグの除去
    text = text.replace(/&nbsp;/g, " "); // &nbsp; をスペースに
    return text;
  }

  function exportPages(rootPageId) {
    // Google Driveのフォルダを作成または取得
    let folder = DriveApp.getRootFolder().getFoldersByName(OUTPUT_DIR);
    if (folder.hasNext()) {
      folder = folder.next();
    } else {
      folder = DriveApp.getRootFolder().createFolder(OUTPUT_DIR);
    }

    // ルートページの内容を取得
    const rootData = getPageContent(rootPageId);
    if (!rootData) return; // エラー処理

    const rootTitle = rootData.title;
    const rootHtml = rootData.body.storage.value;
    const rootMarkdown = convertHtmlToMarkdown(rootHtml);

    // ルートページを保存
    const file = folder.createFile(`${rootTitle}.md`, `# ${rootTitle}

${rootMarkdown}`, MimeType.PLAIN_TEXT);
    Logger.log(`Exported: ${rootTitle}`);

    // サブページを再帰的に処理
    const childrenUrl = `${CONFLUENCE_URL}/rest/api/content?spaceKey=${SPACE_KEY}&ancestor=${rootPageId}`;
    const childrenHeaders = {
      "Authorization": `Bearer ${API_TOKEN}`
    };
    const childrenOptions = {
      "method": "get",
      "headers": childrenHeaders,
      "muteHttpExceptions": true
    };
    const childrenResponse = UrlFetchApp.fetch(childrenUrl, childrenOptions);

    if (childrenResponse.getResponseCode() !== 200) {
      Logger.log(`Error fetching children: ${childrenResponse.getContentText()}`);
      return;
    }

    const children = JSON.parse(childrenResponse.getContentText()).results || [];
    children.forEach(child => exportPages(child.id));
  }

  // スクリプトの実行
  exportPages(ROOT_PAGE_ID);
}

