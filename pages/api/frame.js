// Import the createClient function from the @vercel/kv package
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // Handling GET request to serve the initial poll frame
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title> Will Bitcoin reach $70,000 in 2024?</title>
          <meta property="fc:frame" content="vNext" />
          <meta property="og:title" content="Will bitcoin70k reach $70,000 in 2024?" />
          <meta property="fc:frame:image" content="${process.env["HOST_URL"]}/title.png" />
          <meta property="og:image" content="${process.env["HOST_URL"]}/title.png" />
          <meta property="fc:frame:button:1" content="Yes" />
          <meta property="fc:frame:button:2" content="No" />
          <meta property="fc:frame:post_url" content="${process.env["HOST_URL"]}/api/frame?voted=false" />
        </head>
      </html>
    `);
  }
  // Handling POST request to process the button click and record the vote
  else if (req.method === "POST") {
    const voteDetails = req.body?.untrustedData;
    const voted = req.query["voted"] === "true";
    const votingDeadline = new Date("2025-03-02T04:59:00Z").getTime();
    if (voteDetails.buttonIndex === 2 && voted) {
      // Validate the vote details
      const followMessage = "Follow me for updates";
      res.setHeader("Content-Type", "text/html");
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${process.env["HOST_URL"]}/api/image" />
            <meta property="fc:frame:button:1" content="${followMessage}" />
            <meta name="fc:frame:button:1:action" content="link">
            <meta name="fc:frame:button:1:target" content="https://warpcast.com/robo360.eth" />
          </head>
        </html>
      `);
      return;
    } else {
      try {
        // Key for the vote, using `fid`
        const voteKey = `bitcoin70k:vote:${voteDetails?.fid}`;
        // Check if the vote already exists
        const existingVote = await kv.hgetall(voteKey);
        let imageUrl;
        if (existingVote !== null) {
          // Vote already exists, prevent voting again
          imageUrl =
            existingVote.buttonIndex === "1"
              ? `${process.env["HOST_URL"]}/already_voted_yes.png`
              : `${process.env["HOST_URL"]}/already_voted_no.png`;
          console.log({ imageUrl, existingVote });
        } else {
          if (Date.now() > votingDeadline) {
            const followMessage = "Follow Kramer for updates";
            res.setHeader("Content-Type", "text/html");
            res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${process.env["HOST_URL"]}/no_more_votes.png" />
            <meta property="fc:frame:button:1" content="${followMessage}" />
            <meta name="fc:frame:button:1:action" content="link">
            <meta name="fc:frame:button:1:target" content="https://warpcast.com/robo360.eth" />
            <meta property="fc:frame:button:2" content="View positions" />
            <meta property="fc:frame:post_url" content="${process.env["HOST_URL"]}/api/frame?voted=true" />
          </head>
        </html>`);
            return;
          }
          // Save the new vote
          await kv.hset(voteKey, {
            buttonIndex: voteDetails.buttonIndex,
            timestamp: Date.now(), // Save voting time (optional)
          });

          await kv.hincrby(
            "bitcoin70k:vote:yes",
            "count",
            voteDetails.buttonIndex === 1 ? 1 : 0
          );
          await kv.hincrby(
            "bitcoin70k:vote:no",
            "count",
            voteDetails.buttonIndex === 2 ? 1 : 0
          );

          // Respond based on the buttonIndex
          imageUrl =
            voteDetails.buttonIndex === 1
              ? `${process.env["HOST_URL"]}/yes_vote.png`
              : `${process.env["HOST_URL"]}/no_vote.png`;
        }

        console.log({ imageUrl, voteDetails });

        const followMessage = "Follow me for updates";
        res.setHeader("Content-Type", "text/html");
        res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="fc:frame:button:1" content="${followMessage}" />
            <meta name="fc:frame:button:1:action" content="link">
            <meta name="fc:frame:button:1:target" content="https://warpcast.com/robo360.eth" />
            <meta property="fc:frame:button:2" content="View positions" />
            <meta property="fc:frame:post_url" content="${process.env["HOST_URL"]}/api/frame?voted=true" />
          </head>
        </html>
      `);
      } catch (error) {
        console.error("Error accessing Vercel KV:", error);
        res.status(500).send("An error occurred while recording your vote.");
      }
    }
  } else {
    // Handle any other HTTP method
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
