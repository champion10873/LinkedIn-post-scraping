const { keywords } = require("./config.js");
const Service = require("./api.js");
const fs = require("fs");
const { parse } = require("json2csv");

function saveResult(posts) {
  const csv = parse(posts);

  const currentDate = new Date().toISOString().split("T")[0];
  const filePath = `./result_${currentDate}.csv`;

  const bom = '\ufeff'; // UTF-8 BOM
  const dataToAppend = bom + csv + "\n";

  fs.appendFileSync(filePath, dataToAppend, { encoding: "utf8" }, (err) => {
    if (err) {
      console.error("Error writing to CSV file:", err);
    } else {
      console.log("CSV file saved successfully:", filePath);
    }
  });
}

async function retrievePosts(keyword) {
  let cursor = "";
  let posts = [];

  // while (cursor !== null) {
    const response = await Service.searchPosts(keyword, cursor);
    posts = posts.concat(response.items);
    // cursor = response.cursor;
  // }

  console.log(posts.length, "posts for", keyword);
  const exactPosts = posts.map((post) => {
    return {
      text: post.text,
      postUrl: post.share_url,
      posterId: post.author.id,
    };
  });
  
  saveResult(exactPosts);
}

function main() {
  // for (const keyword of keywords) {
  retrievePosts(keywords[0]);
  // }
}

main();
