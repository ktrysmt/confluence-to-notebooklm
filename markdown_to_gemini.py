import os
import json
import requests

# Geminiの設定
GEMINI_API_URL = "https://gemini.example.com/v1/import"  # 実際のAPIエンドポイント
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"

# ファイルのディレクトリ
INPUT_DIR = "./markdown_files"


def read_markdown_files():
    """Markdownファイルを読み込み、Gemini用のJSON形式に変換"""
    documents = []
    for filename in os.listdir(INPUT_DIR):
        if filename.endswith(".md"):
            with open(os.path.join(INPUT_DIR, filename), "r") as f:
                content = f.read()
                title = content.split("\n")[0].replace(
                    "# ", "")  # 最初の見出しをタイトルとして使用
                documents.append({
                    "title": title,
                    "content": content,
                    "metadata": {"source": "Confluence"}
                })
    return documents


def send_to_gemini(documents):
    """Gemini APIにデータを送信"""
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    response = requests.post(
        GEMINI_API_URL,
        headers=headers,
        json={"documents": documents}
    )
    return response.json()


if __name__ == "__main__":
    documents = read_markdown_files()
    if documents:
        result = send_to_gemini(documents)
        print("Geminiへの送信結果:", result)
    else:
        print("Markdownファイルが見つかりませんでした。")
