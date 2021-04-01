export interface AwardsRawItem {
  title: string[];
  link: string[];
  description: string[];
  pubDate: string[];
}

export interface AwardsRaw {
  rss: {
    $: { version: string };
    channel: {
      title: string[];
      link: string[];
      description: string[];
      language: string[];
      item: AwardsRawItem[];
    }[];
  };
}

/** 月份期數 */
export type InvoiceAwardPeriodType =
  | "1~2"
  | "3~4"
  | "5~6"
  | "7~8"
  | "9~10"
  | "11~12";

/** 統一發票開獎資訊 */
export interface InvoiceAwardInfo {
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

export type InvoiceAwardNameType =
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
export interface InvoiceAwardCheckResult {
  /** 是否中獎 */
  isWin: boolean;
  /** 查詢當下是否已經超過領獎時限 */
  isExpired: boolean;
  /** 當期對獎資訊 */
  awardInfo: InvoiceAwardInfo;
  /** 中獎的獎項名稱 */
  awardName?: InvoiceAwardNameType;
}
