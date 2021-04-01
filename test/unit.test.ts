import { InvoiceAwardNameType, InvoiceAwards } from "../src/index";
async function check(code: string): Promise<InvoiceAwardNameType> {
  let { awardName } = await InvoiceAwards.check(2021, "1~2", code);
  return awardName;
}

describe("InvoiceAwards", () => {
  beforeAll((done) => {
    InvoiceAwards.enabledCache = true;
    done();
  });

  it("fetchAwards", async (done) => {
    let data1 = await InvoiceAwards.fetchAwards();
    expect(Array.isArray(data1)).toEqual(true);
    expect(data1.length).toBeGreaterThanOrEqual(1);
    let data2 = await InvoiceAwards.fetchAwards(true);
    expect(Array.isArray(data2)).toEqual(true);
    expect(data2.length).toBeGreaterThanOrEqual(1);
    InvoiceAwards.cacheTime = 0;
    let data3 = await InvoiceAwards.fetchAwards(true);
    expect(Array.isArray(data3)).toEqual(true);
    expect(data3.length).toBeGreaterThanOrEqual(1);
    InvoiceAwards.cacheTime = 10 * 1000;
    done();
  });

  it("check", async (done) => {
    expect(await check("").catch((error) => error.message)).toEqual(
      "對獎號碼不可為空"
    );
    expect(await check("@").catch((error) => error.message)).toEqual(
      "對獎號碼長度應等於 8"
    );
    expect(
      await InvoiceAwards.check(1, "1~2", "63105417").catch(
        (error) => error.message
      )
    ).toEqual("尚未開獎或查無此次開獎資料");
    expect(await check("@@@@@@@@")).toBeUndefined();
    expect(await check("@@@@@@@5")).toBeUndefined();
    expect(await check("@@@@@@95")).toBeUndefined();
    expect(await check("@@@@@295")).toEqual("增開六獎");
    expect(await check("63105417")).toEqual("頭獎");
    expect(await check("@3105417")).toEqual("二獎");
    expect(await check("@@105417")).toEqual("三獎");
    expect(await check("@@@05417")).toEqual("四獎");
    expect(await check("@@@@5417")).toEqual("五獎");
    expect(await check("@@@@@417")).toEqual("六獎");
    expect(await check("@@@@@@17")).toBeUndefined();
    expect(await check("@@@@@@@7")).toBeUndefined();
    expect(await check("6310541@")).toBeUndefined();
    expect(await check("631054@@")).toBeUndefined();
    expect(await check("63105@@@")).toBeUndefined();
    expect(await check("6310@@@@")).toBeUndefined();
    expect(await check("631@@@@@")).toBeUndefined();
    expect(await check("63@@@@@@")).toBeUndefined();
    expect(await check("6@@@@@@@")).toBeUndefined();
    expect(await check("00581856")).toEqual("頭獎");
    expect(await check("64613291")).toEqual("頭獎");
    expect(await check("95201943")).toEqual("特獎");
    expect(await check("80325690")).toEqual("特別獎");
    done();
  });

  afterAll((done) => {
    InvoiceAwards.reset();
    done();
  });
});
