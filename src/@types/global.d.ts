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

declare interface ClaimHistory {
  amount: number;
  timestamp: number;
}

declare interface IMenuInterface {
  id: number;
  title: string;
  link: string;
}

declare interface IRenderer {
  hours: string;
  minutes: string;
  seconds: string;
  completed: boolean;
}
