# TW Invoice Awards

將 台灣統一發票中獎號碼 提供出 javascript 串接介面

## Dataset

財政部稅務入口站: https://invoice.etax.nat.gov.tw/invoice.xml

## Installation

```
npm install tw-invoice-awards --save
```

## Example

```typescript
/** 月份期數 */
type InvoiceAwardPeriodType = "1~2" | "3~4" | "5~6" | "7~8" | "9~10" | "11~12";

/** 統一發票開獎資訊 */
interface InvoiceAwardInfo {
  /** 標題 */
  title: string;
  /** 西元年份 */
  year: number;
  /** 中華民國年份 */
  rocYear: number;
  /** 月份期數 */
  period: InvoiceAwardPeriodType;
  /** 各獎項號碼 */
  awards: {
    特別獎: string;
    特獎: string;
    頭獎: string[];
    增開六獎: string[];
  };
  /** 領獎起始日期, 格式: YYYY-MM-DD */
  receiveAwardStartAt: string;
  /** 領獎結束日期, 格式: YYYY-MM-DD */
  receiveAwardEndAt: string;
  /** 資料公佈時間, 格式: YYYY-MM-DD HH:mm:ss */
  publishedAt: string;
}

type InvoiceAwardNameType =
  | "特別獎"
  | "特獎"
  | "頭獎"
  | "二獎"
  | "三獎"
  | "四獎"
  | "五獎"
  | "六獎"
  | "增開六獎";

/** 統一發票對獎結果 */
interface InvoiceAwardCheckResult {
  /** 是否中獎 */
  isWin: boolean;
  /** 查詢當下是否已經超過領獎時限 */
  isExpired: boolean;
  /** 當期對獎資訊 */
  awardInfo: InvoiceAwardInfo;
  /** 中獎的獎項名稱 */
  awardName?: InvoiceAwardNameType;
}
```

```typescript
// javascript
const { InvoiceAwards } = require("tw-invoice-awards");
// typescript
import { InvoiceAwards } from "tw-invoice-awards";

// 啟用快取, 選用, 預設: false
InvoiceAwards.enabledCache = true;

// 設定快取時間, 選用, 預設: 24 * 60 * 60 * 1000, 單位: 毫秒
InvoiceAwards.cacheTime = 60 * 1000;

// InvoiceAwards.fetchAwards(forceReload?:boolean): Promise<InvoiceAwardInfo[]>
InvoiceAwards.fetchAwards().then(console.log).catch(console.error);
/** 
[{
  title: '110年01月、02',
  year: 2021,
  rocYear: 110,
  period: '1~2',
  publishedAt: '2021-03-25 14:05:46',
  awards: {
    '特別獎': '80325690',
    '特獎': '95201943',
    '頭獎': [ '64613291', '00581856', '63105417' ],
    '增開六獎': [ '295' ]
  },
  receiveAwardStartAt: '2021-04-06',
  receiveAwardEndAt: '2021-07-05'
}, ......]
*/

// InvoiceAwards.check(year:number, period:string, code:string):Promise<InvoiceAwardCheckResult>
InvoiceAwards.check(2021, "1~2", code).then(console.log).catch(console.error);
```
