declare interface IToken {
  name: string;
  symbol: string;
  src: string;
  addr: string;
}

declare interface INetwork {
  name: string;
  src: string;
}

interface ClaimHistory {
  amount: number;
  timestamp: number;
}
