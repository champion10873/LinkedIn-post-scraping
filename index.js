const { keywords } = require("./config.js");
const Service = require("./api.js");
const fs = require("fs");
const { parse } = require("json2csv");
const cron = require("node-cron");

let bannedPosts = [];

async function saveResult(posts) {
  const currentDate = new Date().toISOString().split("T")[0];
  const fileName = `./result_${currentDate}`;

  // Save data to CSV file
  const csv = parse(posts);
  const bom = "\ufeff"; // UTF-8 BOM
  const dataToAppend = bom + csv + "\n";

  try {
    fs.appendFileSync(`${fileName}.csv`, dataToAppend, { encoding: "utf8" });
    console.log("CSV file saved successfully");
  } catch (err) {
    console.error("Error writing to CSV file:", err);
  }

  // Save data to JSON file
  const jsonContent = JSON.stringify(posts, null, 2); // Pretty print with 2 spaces

  try {
    fs.appendFileSync(`${fileName}.json`, jsonContent, { encoding: "utf8" });
    console.log("JSON file saved successfully");
  } catch (err) {
    console.error("Error writing to file", err);
  }
}

async function retrievePosts(keyword) {
  console.log("Retrieving posts for", keyword);
  let cursor = "";
  let posts = [];

  while (cursor !== null) {
    const response = await Service.searchPosts(keyword, cursor);
    posts = posts.concat(response.items);
    cursor = response.cursor;
  }
  console.log(posts.length, "posts for", keyword);

  // Remove duplicated posts
  posts = posts.filter((post) => !bannedPosts.includes(post.id));
  console.log(posts.length, "posts after filter for", keyword);

  if (posts.length > 0) {
    posts[0].keyword = keyword;
    bannedPosts = bannedPosts.concat(posts.map((post) => post.id));
    console.log(bannedPosts.length, "banned posts");

    const LINKEDIN_PERSONAL = "https://www.linkedin.com/in/";
    const LINKEDIN_COMPANY = "https://www.linkedin.com/company/";

    const exactPosts = posts.map((post) => {
      return {
        keyword: post.keyword,
        text: post.text,
        postUrl: post.share_url,
        posterName: post.author.name,
        posterTitle: post.author.headline,
        posterProfile: post.author.is_company
          ? LINKEDIN_COMPANY + post.author.public_identifier
          : LINKEDIN_PERSONAL + post.author.public_identifier,
      };
    });

    await saveResult(exactPosts);
  } else {
    console.log("No new posts found for", keyword);
  }
}

async function main() {
  for (const keyword of keywords) {
    await retrievePosts(keyword);
  }
}

cron.schedule("0 12 * * *", () => {
  console.log("Running the script every day at noon");
  main().catch((err) => console.error(err));
});
// Optionally, you can also run it immediately when the script starts
main().catch((err) => console.error(err));
