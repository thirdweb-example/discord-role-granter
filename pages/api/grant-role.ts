import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function grantRole(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the login payload out of the request
  console.log(req.body);
  const { loginPayload } = JSON.parse(req.body);

  // Get the Next Auth session so we can use the user ID as part of the discord API request
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }

  // Authenticate login payload
  const sdk = new ThirdwebSDK("mumbai");
  const domain = "example.com";
  // Verify the login payload is real and valid
  const verifiedWalletAddress = sdk.auth.verify(domain, loginPayload);

  // If the login payload is not valid, return an error
  if (!verifiedWalletAddress) {
    res.status(401).json({ error: "Invalid login payload" });
    return;
  }

  // Check if this user owns an NFT
  const editionDrop = await sdk.getContract(
    "0x1fCbA150F05Bbe1C9D21d3ab08E35D682a4c41bF",
    "edition-drop"
  );

  // Get addresses' balance of token ID 0
  const balance = await editionDrop.balanceOf(verifiedWalletAddress, 0);

  if (balance.toNumber() === 0) {
    // If the user is verified and has an NFT, return the content

    // Make a request to the Discord API to get the servers this user is a part of
    const discordServerId = "999533680663998485";

    // @ts-ignore
    const { userId } = session;

    console.log(userId)

    
    const roleId = "999851736028172298";
    console.log(`https://discordapp.com/api/guilds/${discordServerId}/members/${userId}/roles/${roleId}`)
    const response = await fetch(
      // Discord Developer Docs for this API Request: https://discord.com/developers/docs/resources/guild#add-guild-member-role
      `https://discordapp.com/api/guilds/${discordServerId}/members/${userId}/roles/${roleId}`,
      {
        headers: {
          // Use the bot token to grant the role
          Authorization: `Bot ${process.env.BOT_TOKEN}`,
        },
        method: "PUT",
      }
    );

    // If the role was granted, return the content
    if (response.ok) {
      res.status(200).json({ message: "Role granted" });
    }

    // Something went wrong granting the role, but they do have an NFT
    else {
      const resp = await response.json();
      console.error(resp);
      res
        .status(500)
        .json({ error: "Error granting role, are you in the server?" });
    }
  }
  // If the user is verified but doesn't have an NFT, return an error
  else {
    res.status(401).json({ error: "User does not have an NFT" });
  }
}
