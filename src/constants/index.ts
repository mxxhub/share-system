export const projectId = "eb9a852ac6ff9d68cda51f6b43f3e3a4";

export const supportedChains = [
  //   {
  //   id: '0x1',
  //   token: 'ETH',
  //   label: 'Ethereum Mainnet',
  //   rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`
  // },
  {
    id: 11155111,
    token: "ETH",
    label: "Sepolia",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  },
];

export const menus: IMenuInterface[] = [
  { id: 0, title: "Swap AI App", link: "https://app.swapai.tech" },
  { id: 1, title: "$SwapAI Token", link: "https://www.swapai.tech" },
  { id: 2, title: "Support", link: "https://t.me/SwapAIGroup" },
];
