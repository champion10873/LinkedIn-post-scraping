const axios = require("axios");
const { UNIPILE_API_URL, UNIPILE_API_KEY, ACCOUNT_ID } = require("./config.js");

class Services {
  constructor() {
    this.unipileApi = axios.create({
      baseURL: `${UNIPILE_API_URL}/api/v1`,
      headers: {
        "X-API-KEY": UNIPILE_API_KEY,
        accept: "application/json",
        "content-type": "application/json",
      },
    });
  }

  async searchPosts(keyword, cursor) {
    try {
      if (cursor) {
        const response = await this.unipileApi.post(
          "/linkedin/search?account_id=" +
            ACCOUNT_ID +
            "&limit=50&cursor=" +
            cursor,
          {
            api: "classic",
            category: "posts",
            keywords: keyword,
            date_posted: "past_day",
          }
        );
        return response.data;
      } else {
        const response = await this.unipileApi.post(
          "/linkedin/search?account_id=" + ACCOUNT_ID + "&limit=50",
          {
            api: "classic",
            category: "posts",
            keywords: keyword,
            date_posted: "past_day",
          }
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  }
}

module.exports = new Services();
