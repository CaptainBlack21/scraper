import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeAmazonProduct(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    }
  });

  const $ = cheerio.load(data);

  const title = $("#productTitle").text().trim();

  let priceString =
    $("#priceblock_ourprice").text().trim() ||
    $("#priceblock_dealprice").text().trim() ||
    ($("#corePriceDisplay_desktop_feature_div .a-price .a-price-whole").first().text().trim() +
     $("#corePriceDisplay_desktop_feature_div .a-price .a-price-fraction").first().text().trim());

  if (!priceString) {
    console.warn(`⚠️ Fiyat bulunamadı: ${title} (${url})`);
    throw new Error("Fiyat bulunamadı!");
  }

  const price = parseFloat(priceString.replace(/[^\d,]/g, "").replace(",", "."));
  if (isNaN(price)) {
    console.warn(`⚠️ Fiyat sayıya dönüştürülemedi: ${title} (${url})`);
    throw new Error("Fiyat sayıya dönüştürülemedi!");
  }

  return { title, price };
}
