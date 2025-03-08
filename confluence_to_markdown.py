import os
import requests
from bs4 import BeautifulSoup

# Confluenceの設定
CONFLUENCE_URL = "https://your-confluence-domain.atlassian.net"
SPACE_KEY = "YOUR_SPACE_KEY"  # エクスポート対象のスペースキー
API_TOKEN = "YOUR_API_TOKEN"  # ConfluenceのAPIトークン
OUTPUT_DIR = "./markdown_files"  # 出力先ディレクトリ


def get_page_content(page_id):
    """Confluenceのページ内容を取得"""
    url = f"{CONFLUENCE_URL}/rest/api/content/{page_id}?expand=body.storage"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    return response.json()


def convert_html_to_markdown(html_content):
    """HTMLをMarkdownに変換（簡易処理）"""
    soup = BeautifulSoup(html_content, "html.parser")
    text = soup.get_text(separator="\n", strip=True)
    # さらに高度な変換が必要な場合はhtml2textライブラリを使用推奨
    return text


def export_pages(root_page_id):
    """指定されたルートページからサブページを再帰的にエクスポート"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ルートページの内容を取得
    root_data = get_page_content(root_page_id)
    root_title = root_data["title"]
    root_html = root_data["body"]["storage"]["value"]
    root_markdown = convert_html_to_markdown(root_html)

    # ルートページを保存
    with open(f"{OUTPUT_DIR}/{root_title}.md", "w") as f:
        f.write(f"# {root_title}\n\n{root_markdown}")
    print(f"Exported: {root_title}")

    # サブページを再帰的に処理
    children_url = f"{CONFLUENCE_URL}/rest/api/content?spaceKey={SPACE_KEY}&ancestor={root_page_id}"
    children_response = requests.get(
        children_url, headers={"Authorization": f"Bearer {API_TOKEN}"})
    for child in children_response.json().get("results", []):
        export_pages(child["id"])


if __name__ == "__main__":
    # ルートページのIDを指定（トップページのIDを調べる必要があります）
    ROOT_PAGE_ID = "123456789"  # 例: ConfluenceのトップページID
    export_pages(ROOT_PAGE_ID)
