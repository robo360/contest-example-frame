// Import the createClient function from the @vercel/kv package
import { kv } from "@vercel/kv";
import satori from "satori";
import sharp from "sharp";
import { join } from "path";
import * as fs from "fs";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
let fontData = fs.readFileSync(fontPath);

export default async function handler(req, res) {
  if (req.method === "GET") {
    const yesVotes = (await kv.hget("bitcoin70k:vote:yes", "count")) || 0;
    const noVotes = (await kv.hget("bitcoin70k:vote:no", "count")) || 0;

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "rgba(0, 0, 0, 1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            color: "white",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "20px",
            borderRadius: "1px",
            margin: "20px 0",
          }}
        >
          Will Bitcoin reach $70,000 in 2024?
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "20px",
            borderRadius: "1px",
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "32px",
              color: "white",
              marginBottom: "20px",
            }}
          >
            Positions
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "100px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  padding: "10px 20px",
                  borderRadius: "1px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  marginBottom: "10px",
                }}
              >
                Yes
              </span>
              <span
                style={{
                  fontSize: "32px",
                  padding: "10px 20px",
                  borderRadius: "1px",
                }}
              >
                {yesVotes}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "36px",
                  padding: "10px 20px",
                  borderRadius: "1px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  marginBottom: "10px",
                }}
              >
                No
              </span>
              <span
                style={{
                  fontSize: "32px",
                  padding: "10px 20px",
                  borderRadius: "1px",
                }}
              >
                {noVotes}
              </span>
            </div>
          </div>
        </div>
      </div>,
      {
        width: 1200,
        height: 600,
        fonts: [
          {
            name: "Roboto",
            // Use `fs` (Node.js only) or `fetch` to read the font as Buffer/ArrayBuffer and provide `data` here.
            data: fontData,
            weight: 400,
            style: "normal",
          },
        ],
      }
    );

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    // Set the content type to PNG and send the response
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "max-age=10");
    res.send(pngBuffer);
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
