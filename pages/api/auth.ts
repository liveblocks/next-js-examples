import { authorize } from "@liveblocks/node";
import { NextApiRequest, NextApiResponse } from "next";

const API_KEY = process.env.LIVEBLOCKS_SECRET_KEY;

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  if (!API_KEY) {
    return res.status(403).end();
  }

  const room = req.body.room;

  if (room === "example-live-cursors-avatars") {
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

    const response = await authorize({
      room,
      secret: API_KEY,
      userInfo: {
        name: `${adjective} ${animal}`,
        picture: `${animal}.svg`,
      },
    });
    return res.status(response.status).end(response.body);
  }

  const response = await authorize({
    room,
    secret: API_KEY,
  });
  return res.status(response.status).end(response.body);
}

const ADJECTIVES = ["Brave", "Mighty", "Glowing", "Silly", "Wise"];

const ANIMALS = ["Bear", "Fox", "Giraffe"];
