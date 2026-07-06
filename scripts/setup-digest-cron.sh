#!/usr/bin/env bash
# 每日回饋彙整信 cron 一鍵設定 + 自我驗證（運動禁藥案例平台）
#   端點：GET /api/cron/feedback-digest（header: x-cron-secret: <CRON_SECRET>）
#   實作：backend/routes/feedbackDigest.js（Express + Mongo + ZSend）
# 動機：過去設 CRON_SECRET 後反覆 401 來回（設了變數沒 redeploy / header 不匹配 / secret 沒對上）。
#       這支把「猜哪裡錯」變成「一跑就知道通沒通、哪裡錯、cron 那邊填什麼」。
#
# 用法：
#   scripts/setup-digest-cron.sh gen               # 產生 CRON_SECRET + 印出要在 Zeabur 設的變數
#   scripts/setup-digest-cron.sh verify            # 驗證 production（讀 backend/.env 的 CRON_SECRET）
#   scripts/setup-digest-cron.sh verify <URL> <SECRET>   # 指定站台/密鑰驗證
#   SITE_URL=https://... CRON_SECRET=... scripts/setup-digest-cron.sh verify
#
# 純非互動、可重複跑。verify 用「錯 secret」時被 401 擋下、不會觸發寄信；
# 用「對 secret」時 endpoint 會真的執行彙整（若 24h 內有回饋就寄一封信）——這是預期行為。

set -euo pipefail

DEFAULT_URL="https://antidopingplatform.sportsmedicine.tw"
ENDPOINT_PATH="/api/cron/feedback-digest"
HEADER_NAME="x-cron-secret"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SELF_DIR")"

c_red=$'\033[31m'; c_grn=$'\033[32m'; c_ylw=$'\033[33m'; c_cyn=$'\033[36m'; c_rst=$'\033[0m'
say() { printf '%s\n' "$*"; }

# 從 backend/.env / .env 讀某個變數值（去掉引號），找不到回空
read_env() {
  local key="$1" f v
  for f in "$REPO_DIR/backend/.env" "$REPO_DIR/.env"; do
    [ -f "$f" ] || continue
    v="$(grep -E "^${key}=" "$f" | tail -1 | sed -E "s/^${key}=//; s/^[\"']//; s/[\"']$//")"
    if [ -n "$v" ]; then printf '%s' "$v"; return 0; fi
  done
  printf ''
}

cmd_gen() {
  local secret
  secret="$(openssl rand -hex 32)"
  say ""
  say "${c_grn}[OK] 已產生新的 CRON_SECRET${c_rst}"
  say ""
  say "${c_cyn}(1) 到 Zeabur -> 該 service -> Variables，設定以下 4 個變數：${c_rst}"
  say "   CRON_SECRET=${secret}"
  say "   FEEDBACK_DIGEST_TO=<你的收件信箱，可逗號分隔多個>"
  say "   ZSEND_API_KEY=<Zeabur ZSend -> API Key>"
  say "   ZSEND_FROM=<已驗證寄件地址，例 noreply@sportsmedicine.tw>"
  say ""
  say "${c_ylw}(2) 設完務必 Redeploy${c_rst}（Zeabur 變數改了不重啟不生效——這是 401 頭號原因）"
  say ""
  say "${c_cyn}(3) 同步寫進本地 backend/.env（給 verify 用）：${c_rst}"
  say "   echo 'CRON_SECRET=\"${secret}\"' >> \"$REPO_DIR/backend/.env\""
  say ""
  say "${c_cyn}(4) Redeploy 完成後跑：${c_rst}  scripts/setup-digest-cron.sh verify"
  say ""
}

cmd_verify() {
  local url="${1:-${SITE_URL:-$DEFAULT_URL}}"
  local secret="${2:-${CRON_SECRET:-$(read_env CRON_SECRET)}}"
  url="${url%/}"
  local full="${url}${ENDPOINT_PATH}"

  if [ -z "$secret" ]; then
    say "${c_red}[X] 找不到 CRON_SECRET${c_rst}：請帶參數、設環境變數、或寫進 backend/.env。先跑 gen。" >&2
    exit 2
  fi

  say "${c_cyn}-> 驗證 ${full}${c_rst}"
  local status
  status="$(curl -sS -m 20 -o /dev/null -w '%{http_code}' -H "${HEADER_NAME}: ${secret}" "$full" 2>/dev/null || echo "000")"

  case "$status" in
    200|204)
      say "${c_grn}[OK] ${status} — cron 端點驗證通過，彙整信流程已就緒${c_rst}"
      say ""
      say "${c_cyn}到 cron-job.org（或 Zeabur 排程）建立每日任務，照這樣填：${c_rst}"
      say "   URL      : ${full}"
      say "   Method   : GET"
      say "   Header   : ${HEADER_NAME}: ${secret}"
      say "   Schedule : 每天一次（建議台北 08:00 -> UTC 00:00）"
      say ""
      say "${c_ylw}注意：secret 只放 header，不要放 ?secret= query（會洩漏到 log / Referer）${c_rst}"
      ;;
    401|403)
      say "${c_red}[X] ${status} Unauthorized — secret 沒對上，最可能三個原因：${c_rst}" >&2
      say "   1. Zeabur 變數設了但${c_ylw}沒 Redeploy${c_rst}（改完必重啟）" >&2
      say "   2. 本地 backend/.env 的 CRON_SECRET 與 Zeabur 上的不一致" >&2
      say "   3. header 名稱要用 ${HEADER_NAME}（不是 Authorization / ?secret=）" >&2
      exit 1
      ;;
    404)
      say "${c_red}[X] 404 — 端點不存在，確認已部署最新 code（${ENDPOINT_PATH}）且網址正確${c_rst}" >&2
      exit 1
      ;;
    000)
      say "${c_red}[X] 連不上 ${url} — 檢查網址 / DNS / 服務是否在線${c_rst}" >&2
      exit 1
      ;;
    *)
      say "${c_ylw}[!] 非預期狀態 ${status} — 端點有回應但不是 200，看 Zeabur runtime log${c_rst}" >&2
      exit 1
      ;;
  esac
}

case "${1:-}" in
  gen)    cmd_gen ;;
  verify) shift; cmd_verify "$@" ;;
  *)
    say "用法："
    say "  scripts/setup-digest-cron.sh gen                    # 產生 secret + 印出 Zeabur 變數清單"
    say "  scripts/setup-digest-cron.sh verify                 # 驗證 production（讀 backend/.env）"
    say "  scripts/setup-digest-cron.sh verify <URL> <SECRET>  # 指定站台/密鑰"
    exit 1
    ;;
esac
