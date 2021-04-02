import axios from "axios";
import dayjs from "dayjs";
import {
  AwardsRaw,
  AwardsRawItem,
  InvoiceAwardCheckResult,
  InvoiceAwardInfo,
  InvoiceAwardNameType,
  InvoiceAwardPeriodType,
} from "invoice-awards.dto";
import { parseStringPromise } from "xml2js";

export {
  InvoiceAwardInfo,
  InvoiceAwardPeriodType,
  InvoiceAwardNameType,
  InvoiceAwardCheckResult,
};
const DATA_URL = "https://invoice.etax.nat.gov.tw/invoice.xml";

export class InvoiceAwards {
  /**
   * 是否開啟快取功能
   * 預設: 關閉
   */
  public static enabledCache: boolean = false;
  /** 快取時間
   * 預設: 24 小時
   * 單位: 毫秒
   */
  public static cacheTime: number = 24 * 60 * 60 * 1000;

  private static cacheTimer: any;

  private static cache: Promise<InvoiceAwardInfo[]>;

  private static periodMap: { [month: number]: InvoiceAwardPeriodType } = {
    1: "1~2",
    2: "1~2",
    3: "3~4",
    4: "3~4",
    5: "5~6",
    6: "5~6",
    7: "7~8",
    8: "7~8",
    9: "9~10",
    10: "9~10",
    11: "11~12",
    12: "11~12",
  };

  public static async fetchAwards(
    /** 強制重新載入 */
    forceReload: boolean = false
  ): Promise<InvoiceAwardInfo[]> {
    if (!InvoiceAwards.enabledCache) return this.loadAwards();
    if (InvoiceAwards.cache && !forceReload) return InvoiceAwards.cache;
    InvoiceAwards.cache = this.loadAwards();
    if (InvoiceAwards.cacheTimer) {
      clearTimeout(InvoiceAwards.cacheTimer);
    }
    InvoiceAwards.cacheTimer = setTimeout(() => {
      InvoiceAwards.cache = null;
      InvoiceAwards.cacheTimer = null;
    }, InvoiceAwards.cacheTime);
    return InvoiceAwards.cache;
  }

  private static async loadAwards(): Promise<InvoiceAwardInfo[]> {
    let res = await axios.get(DATA_URL);
    const xml = res.data;
    let data: AwardsRaw = await parseStringPromise(xml);
    let items = data.rss.channel[0].item;
    return items.map((item) => InvoiceAwards.rawToAwardItem(item));
  }

  private static rawToAwardItem(raw: AwardsRawItem): InvoiceAwardInfo {
    let title = raw.title[0];
    let [date, rocYearStr, monthStr] = title.match(/^(\d{3})年(\d{2})月/);

    let rocYear = parseInt(rocYearStr, 10);
    let year = rocYear + 1911;
    let baseDate = dayjs(`${year}-${monthStr}-01`);
    let receiveAwardStartAt = baseDate.add(3, "months").format("YYYY-MM-06");
    let receiveAwardEndAt = baseDate.add(6, "months").format("YYYY-MM-05");
    let month = parseInt(monthStr, 10);
    let period = InvoiceAwards.periodMap[month];
    let publishedAt = dayjs(raw.pubDate[0]).format("YYYY-MM-DD HH:mm:ss");
    let strs = raw.description[0].split(/\<\/*p\>/).filter(Boolean);
    const code8Regexp = /\d{8}/g;
    const code3Regexp = /\d{3}/g;
    return {
      title,
      year,
      rocYear,
      period,
      publishedAt,
      awards: {
        特別獎: strs[0].match(code8Regexp).pop(),
        特獎: strs[1].match(code8Regexp).pop(),
        頭獎: strs[2].match(code8Regexp),
        增開六獎: strs[3].match(code3Regexp),
      },
      receiveAwardStartAt,
      receiveAwardEndAt,
    };
  }

  public static async check(
    /** 西元年 */
    year: number,
    /** 月份期數 */
    period: InvoiceAwardPeriodType,
    /** 對獎號獎 */
    code: string
  ): Promise<InvoiceAwardCheckResult> {
    if (!code || typeof code !== "string") throw new Error("對獎號碼不可為空");
    if (code.length !== 8) throw new Error("對獎號碼長度應等於 8");
    let awards = await InvoiceAwards.fetchAwards();
    let awardInfo = awards.find((a) => a.year === year && a.period === period);
    if (!awardInfo) throw new Error("尚未開獎或查無此次開獎資料");
    let isExpired = dayjs().isAfter(awardInfo.receiveAwardEndAt);
    let result: InvoiceAwardCheckResult = {
      isWin: false,
      isExpired,
      awardInfo,
    };
    if (code === awardInfo.awards["特別獎"]) {
      result.isWin = true;
      result.awardName = "特別獎";
      return result;
    }
    if (code === awardInfo.awards["特獎"]) {
      result.isWin = true;
      result.awardName = "特獎";
      return result;
    }
    for (let awardCode of awardInfo.awards["頭獎"]) {
      let val = InvoiceAwards.checkCode(awardCode, code);
      switch (val) {
        default:
          break;

        case 3:
          result.isWin = true;
          result.awardName = "六獎";
          return result;

        case 4:
          result.isWin = true;
          result.awardName = "五獎";
          return result;

        case 5:
          result.isWin = true;
          result.awardName = "四獎";
          return result;

        case 6:
          result.isWin = true;
          result.awardName = "三獎";
          return result;

        case 7:
          result.isWin = true;
          result.awardName = "二獎";
          return result;

        case 8:
          result.isWin = true;
          result.awardName = "頭獎";
          return result;
      }
    }
    for (let awardCode of awardInfo.awards["增開六獎"]) {
      let val = InvoiceAwards.checkCode(awardCode.padStart(8, "-"), code);
      if (val === 3) {
        result.isWin = true;
        result.awardName = "增開六獎";
      }
    }
    return result;
  }

  private static checkCode(a: string, b: string): number {
    for (let i = 7; i >= 0; i--) {
      if (a[i] !== b[i]) return 7 - i;
    }
    return 8;
  }

  public static reset(): void {
    if (InvoiceAwards.cacheTimer) {
      clearTimeout(InvoiceAwards.cacheTimer);
    }
    InvoiceAwards.cache = null;
    InvoiceAwards.cacheTimer = null;
  }
}
