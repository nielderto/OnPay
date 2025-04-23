export const idrxPayConfig = {
    address : "0xc8a2d4C87BEa01da4583f344543F3c5CfC40E58c",
    abi:  [
        {
          inputs: [{ internalType: "address", name: "_idrxToken", type: "address" }],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          inputs: [],
          name: "IDRXPayment__AmountMustBeGreaterThanZero",
          type: "error",
        },
        { inputs: [], name: "IDRXPayment__CantSentToYourself", type: "error" },
        { inputs: [], name: "IDRXPayment__InvalidReceiverAddress", type: "error" },
        { inputs: [], name: "IDRXPayment__InvalidTokenAddress", type: "error" },
        { inputs: [], name: "IDRXPayment__TransferFailed", type: "error" },
        {
          inputs: [{ internalType: "address", name: "owner", type: "address" }],
          name: "OwnableInvalidOwner",
          type: "error",
        },
        {
          inputs: [{ internalType: "address", name: "account", type: "address" }],
          name: "OwnableUnauthorizedAccount",
          type: "error",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "previousOwner",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "newOwner",
              type: "address",
            },
          ],
          name: "OwnershipTransferred",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "sender",
              type: "address",
            },
            {
              indexed: true,
              internalType: "address",
              name: "receiver",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
          ],
          name: "PaymentCompleted",
          type: "event",
        },
        {
          inputs: [],
          name: "idrxToken",
          outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "renounceOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "_receiver", type: "address" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
          ],
          name: "sendIDRX",
          outputs: [{ internalType: "bool", name: "success", type: "bool" }],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
          name: "transferOwnership",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "_newIdrxToken", type: "address" },
          ],
          name: "updateTokenAddress",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ] 
}as const