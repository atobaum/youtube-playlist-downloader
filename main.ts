import axios from "axios";
import { writeFile } from "fs/promises";
import "dotenv/config";

const API_KEY = process.env.API_KEY;
const PLAYLIST_ID = process.env.PLAYLIST_ID;

if (!API_KEY || !PLAYLIST_ID) {
  console.log("API_KEY or PLAYLIST_ID not set.");
  process.exit(1);
}

type VideoItem = {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: "SONG MINHO - string(feat. TAEYANG) 0821 Mnet SHOW ME THE MONEY 4";
    description: string;
    thumbnails: any;
    channelTitle: string;
    playlistId: string;
    position: 0;
    resourceId: { kind: string; videoId: string };
    videoOwnerChannelTitle: string;
    videoOwnerChannelId: string;
  };
};

function getList(params: {
  pageToken: undefined | string;
  maxResults: number;
}): Promise<{
  kind: string;
  etag: string;
  nextPageToken: string;
  items: Array<VideoItem>;
  pageInfo: { totalResults: number; resultsPerPage: number };
}> {
  return axios
    .get<{
      kind: string;
      etag: string;
      nextPageToken: string;
      items: Array<VideoItem>;
      pageInfo: { totalResults: number; resultsPerPage: number };
    }>("https://youtube.googleapis.com/youtube/v3/playlistItems", {
      params: {
        part: "snippet",
        playlistId: PLAYLIST_ID,
        key: API_KEY,
        maxResults: params.maxResults,
        pageToken: params.pageToken,
      },
    })
    .then((res) => res.data);
}

async function execute() {
  const data: any[] = [];
  let nextPageToken: string | undefined = undefined;
  while (true) {
    const result = await getList({ maxResults: 50, pageToken: nextPageToken });
    result.items.forEach((item) => data.push(item));
    nextPageToken = result.nextPageToken;
    console.log({ nextPageToken, data });

    if (!nextPageToken) {
      break;
    }
  }
  return { date: new Date().toISOString(), items: data, count: data.length };
}

function saveFile(data: any) {
  return writeFile(
    `./playlist-${new Date().toISOString()}.json`,
    JSON.stringify(data, null, 2),
    {
      encoding: "utf-8",
    }
  );
}

async function main() {
  const result = await execute();
  await saveFile(result);
  console.log(result);
}
main();
