# Discord Bot Granter

This template uses the [authentication SDK](https://thirdweb.com/authentication)
along with Discord OAuth to grant users who own an NFT from a specific collection a special role
in a Discord server.

## Tools:

- [**React SDK**](https://docs.thirdweb.com/react): To connect to the user's MetaMask wallet.

- [**TypeScript SDK**](https://docs.thirdweb.com/typescript): To view the balance of the connected wallet in an NFT collection.

- [**Authentication SDK**](https://thirdweb.com/authentication) to allow the user to sign in with Ethereum and verify they own their wallet.

- [**Next Auth**](https://next-auth.js.org/): To authenticate with Discord and access the user's Discord data such as their user ID.

- [**Discord API**](https://discord.com/developers/docs) to grant users a role in our Discord server.

## Using This Repo

To create a clone of this repository, you can use the [thirdweb CLI](https://portal.thirdweb.com/thirdweb-cli)

```bash
npx thirdweb create --template discord-role-granter
```

# Guide

You can follow along with the guide below to set this up for your Discord server and role.

To set up the Discord Bot you can follow our full guide at TODO.

Below, we'll explore the key pieces of the codebase.

### thirdweb and NextAuth Wrappers

To authenticate users with both their **wallet** and their Discord account, we wrap our application in two Provider components:

```tsx
// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mumbai;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId}>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
        <ThirdwebGuideFooter />
      </SessionProvider>
    </ThirdwebProvider>
  );
}
```

This allows us to access the helpful hooks of the React SDK and NextAuth to read information about the current user and their wallet.

### Discord Oauth

NextAuth handles the Oauth flow of signing in with Discord for us in
the [[...nextauth.ts]](./pages/api/auth/[...nextauth].ts) file.
We add some additional logic to append the user ID to the
information that is available to us so that we can read that inside our API route.

```tsx
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
    }),
  ],

  // When the user signs in, get their token
  callbacks: {
    async jwt({ token, account }) {
      // Persist the user ID to the token right after signin
      if (account) {
        console.log(account);
        token.userId = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token, user }) {
      session.userId = token.userId;
      return session;
    },
  },
});
```

### Connect Wallet & Sign In With Discord

We have a component called [SignIn](./components/SignIn.tsx) that shows the user different buttons
depending on whether they have their wallet connected and Discord account connected.

In this component, three states can occur:

1. The user is connected to both `wallet` and `Discord` => We show them the `Give me the role` button.
2. The user is not connected to `wallet` => We ask them to connect their wallet.
3. The user is not connected to `Discord`=> We ask them to authenticate with Discord.

### Authenticating Wallet

Once users have signed in with their wallet and Discord account, they are shown a button that makes an API
request to grant them a role in the Discord server.

First, we need to prove that the user owns the wallet by using the authentication SDK.

**Sign in with ethereum**:

```tsx
// First, login and sign a message
const domain = "thirdweb.com";
const loginPayload = await sdk?.auth.login(domain);
console.log(loginPayload);
```

**Make the request to the API route with the login payload**

```tsx
// Then make a request to our API endpoint.
try {
  const response = await fetch("/api/grant-role", {
    method: "POST",
    body: JSON.stringify({
      loginPayload,
    }),
  });
  const data = await response.json();
  console.log(data);
  alert("Check the console for the response!");
} catch (e) {
  console.error(e);
}
```

**Verify the login payload on the server**

```tsx
const { loginPayload } = JSON.parse(req.body);
// Authenticate login payload
const sdk = new ThirdwebSDK("mumbai");
const domain = "thirdweb.com";
// Verify the login payload is real and valid
const verifiedWalletAddress = sdk.auth.verify(domain, loginPayload);
```

### Checking NFT Balance

Using the TypeScript SDK, we can check the balance of the wallet for a specific ERC-1155 token in a specific collection.

```tsx
// Check if this user owns an NFT
const editionDrop = sdk.getEditionDrop(
  "0x1fCbA150F05Bbe1C9D21d3ab08E35D682a4c41bF"
);

// Get addresses' balance of token ID 0
const balance = await editionDrop.balanceOf(verifiedWalletAddress, 0);
```

### Granting Role

Using our Discord bot's token as the authorization header, we can grant the user a role in the Discord server
_if_ they own an NFT in the collection.

```tsx
if (balance.toNumber() > 0) {
  // If the user is verified and has an NFT, return the content

  // Make a request to the Discord API to get the servers this user is a part of
  const discordServerId = "999533680663998485";
  const { userId } = session;
  const roleId = "999851736028172298";
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
```

## Join our Discord!

For any questions, suggestions, join our discord at [https://discord.gg/thirdweb](https://discord.gg/thirdweb).
