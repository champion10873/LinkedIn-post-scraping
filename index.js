const { keywords } = require("./config.js");
const Service = require("./api.js");
const fs = require("fs");
const { parse } = require("json2csv");
const cron = require("node-cron");
const sendFile = require("./sendFile.js");

let bannedPosts = [];

async function saveResult(posts) {
  const currentDate = new Date().toISOString().split("T")[0];
  const filePath = `./result_${currentDate}.csv`;

  // Save data to CSV file
  let csv;
  if (fs.existsSync(filePath)) {
    csv = parse(posts, { header: false });
  } else {
    csv = parse(posts);
  }
  const bom = "\ufeff"; // UTF-8 BOM
  const dataToAppend = bom + csv + "\n";

  try {
    fs.appendFileSync(filePath, dataToAppend, { encoding: "utf8" });
    // console.log("CSV file saved successfully");
  } catch (err) {
    console.error("Error writing to CSV file:", err);
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
  // Initialize
  bannedPosts = [];
  const currentDate = new Date().toISOString().split("T")[0];
  const filePath = `./result_${currentDate}.csv`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  console.log("Running the script for", currentDate);

  for (const keyword of keywords) {
    await retrievePosts(keyword);
  }

  await sendFile(currentDate);
  console.log("Sent file for", currentDate);
}

// cron.schedule("0 12 * * *", () => {
//   main().catch((err) => console.error(err));
// });

// console.log("This script is running every day at 12:00 PM");

// Optionally, you can also run it immediately when the script starts
main().catch((err) => console.error(err));
