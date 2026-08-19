# 「與我們合作」表單 — Google Apps Script 設定

首頁「與我們合作」（`#collaboration .collabForm`）表單沒有自己的後端 API，改用 Google Apps Script 當輕量後端：表單送出後，Apps Script 會：

1. 把送出時間、聯絡人、職稱、Email、合作內容寫入一份 Google Sheet 存底
2. 寄信通知：目前先寄給 `flyzero@tvbs.com.tw` 和 `richile0819@tvbs.com.tw` 做測試，正式上線前要記得換成正式收件人（例如新聞部 國際新聞事務主管　蔣翠芳 副理　monica@tvbs.com.tw）

## 目前部署狀態

- **Apps Script 專案帳號**：`flyzero@innov.tvbs.com.tw`（公司網域帳號，不是個人 Gmail — 這樣寄件人識別、維運歸屬才正常，避免綁在個人帳號上）
- **Google Sheet**：<https://docs.google.com/spreadsheets/d/1LVSjtFx6NXNGdJ9AKopzkFLECYey6DaUYuutMm8zC8k/edit?gid=0#gid=0>（欄位順序：送出時間／聯絡人／職稱／Email／合作內容），需與 Apps Script 同一個帳號有「編輯者」權限才能寫入。
- **部署網址（已填入 `Partners.astro`）**：
  `https://script.google.com/macros/s/AKfycbyyxOEmcBRaiREKI1GM2VoEGrlR9Uwij642eHcD2_Sy3iaDc1Quhu8YlYbTXwHniCw/exec`

## 部署步驟（如果要重新建立整套流程）

1. 前往 [script.google.com](https://script.google.com/)，用要作為正式寄件者/維運者的帳號登入（建議用公司網域帳號，不要用個人 Gmail），「新增專案」。
2. 把下面〈Apps Script 程式碼〉整段貼進去，取代預設的 `myFunction`；`SHEET_ID` 換成實際要寫入的 Google Sheet ID。
3. 確認該帳號對目標 Google Sheet 有「編輯者」權限（否則 `SpreadsheetApp.openById()` 會因權限不足而失敗）。
4. 右上角「部署」→「新增部署作業」：
   - 類型選「網頁應用程式」
   - 「具有存取權限的使用者」選「**所有人**」（表單要能被匿名訪客送出，否則會被要求登入 Google 帳號）
   - 執行身分選「我」
   - 部署後會拿到一個網址，格式類似：
     `https://script.google.com/macros/s/AKfycb.../exec`
5. 把這個網址填進 `src/components/index/Partners.astro` 裡的 `COLLAB_FORM_ENDPOINT` 常數。
6. 之後如果修改了 Apps Script 程式碼，記得要「管理部署作業」→ 編輯 → 建立新版本才會生效（單純儲存指令碼不會更新已部署的網址；網址本身不會變）。

## Apps Script 程式碼

```javascript
const SHEET_ID = '1LVSjtFx6NXNGdJ9AKopzkFLECYey6DaUYuutMm8zC8k';

function doPost(e) {
  const data = e.parameter;

  const name = data.collabName || '';
  const title = data.collabTitle || '';
  const email = data.collabEmail || '';
  const content = data.collabContent || '';
  const timestamp = new Date();

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
  sheet.appendRow([timestamp, name, title, email, content]);

  const subject = '[官網合作洽詢] 來自 ' + name;
  const body =
    '收到一筆來自官網「與我們合作」表單的洽詢：\n\n' +
    '聯絡人：' + name + '\n' +
    '職稱：' + title + '\n' +
    'Email：' + email + '\n' +
    '合作內容：' + content + '\n\n' +
    '送出時間：' + timestamp;

  MailApp.sendEmail({
    to: 'flyzero@tvbs.com.tw,richile0819@tvbs.com.tw', // TODO: 測試沒問題後要換成正式收件人
    subject: subject,
    body: body,
    replyTo: email, // 直接回信就會回到洽詢人的信箱
  });

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 測試方式

最快的測試方式不用透過網站表單，直接在 Apps Script 編輯器裡測：

1. 在程式碼最下面暫時加一個測試用函式：
   ```javascript
   function testSend() {
     doPost({ parameter: { collabName: '測試', collabTitle: '測試職稱', collabEmail: 'test@example.com', collabContent: '這是一則測試訊息' } });
   }
   ```
2. 上方函式選單切換選到 `testSend`，按執行（第一次執行、或新增了 SpreadsheetApp 這類新的服務時，會跳出 Google 帳號授權畫面，同意即可；授權彈出視窗是獨立的瀏覽器視窗，跳出後要在該視窗裡手動走完「選帳號 →（若有警告）進階 → 前往...(不安全) → 允許」）。
3. 檢查收件信箱有沒有收到信、Google Sheet 有沒有新增一列。
4. 測試完成後把 `testSend` 這段刪掉，存檔，並依照〈部署步驟〉建立新的部署版本，讓正式的 Web App 網址套用最新程式碼。

## 已知限制

前台改用 `fetch(url, { mode: 'no-cors' })` 送出表單，這是因為 Apps Script 網頁應用程式對跨網域 POST 的 CORS 支援不穩定，用 `no-cors` 可以避開瀏覽器的預檢請求；代價是前台讀不到 Apps Script 回應的實際內容或狀態碼，只要 `fetch` 沒有丟出網路層錯誤（例如網址打錯、離線），就會顯示「送出成功」。也就是說，如果 Apps Script 內部執行出錯（例如信箱格式不對導致 `MailApp.sendEmail` 拋錯，或該帳號對 Sheet 沒有編輯權限導致 `appendRow` 拋錯），前台目前不會知道、還是會顯示成功。之後如果要更嚴謹的錯誤回報，需要換掉 `no-cors` 的做法（例如透過自己的後端 API 轉發，而不是直接呼叫 Apps Script）。
