import { createMachine, interpret } from "xstate";

const tutorialMachine = createMachine({
  id: "metaMask training machine",
  predictableActionArguments: true,
  initial: "start",
  context: {
    answer: "",
  },
  states: {
    // ui: do you know what is a wallet?
    // openAI question: give me introduction about metaMask? 1-1
    start: {
      on: {
        YES: { target: "setWallet" },
        NO: { target: "walletIntro" },
      },
      tags: ["Do you know what a wallet is?"],
    },
    // openAI answer 1-1
    walletIntro: {
      on: {
        NEXT: {
          target: "setWallet",
        },
      },
      tags: [
        "Do you know what a wallet is?",
        "What is  a metamask wallet? Give me the answer in 5 bullet points. Limit word count to 100/200.",
      ],
    },
    // ui: do you want to have a wallet?
    // openAI questions: 2-1
    // 1. list steps to install a wallet;
    // 2. pay attentions items
    // 3. show metaMask install link
    setWallet: {
      on: {
        YES: { target: "walletAttention" },
        NO: { target: "final" },
      },
      tags: ["Do you want to have a wallet?"],
    },
    walletAttention: {
      on: {
        NEXT: {
          target: "moreInforOfWallet",
        },
      },
      tags: [
        "Do you want to set up a wallet?",
        "How to set up a metaMask wallet? Give me the answer in 5 bullet points. Limit word count to 100/200.",
      ],
    },
    // UI: do you want to know more about metaMask setting
    moreInforOfWallet: {
      on: {
        YES: {
          target: "signature",
        },
        NO: {
          target: "addChain",
        },
      },
      tags: ["Do you want to know what a signature is?"],
    },
    // UI: do you want to know about wallet signature
    // openAI: list signature usage in wallet 3-1
    signature: {
      on: {
        YES: {
          target: "signatureInfor",
        },
        NO: {
          target: "addChain",
        },
      },
      tags: ["Do you want to know signature in metaMask?"],
    },
    signatureInfor: {
      on: {
        NEXT: {
          target: "addChain",
        },
      },
      tags: [
        "Do you want to know what a signature is?",
        "What is a wallet signature request? Give me the answer in 5 bullet points. Limit word count to 100/200.",
      ],
    },
    // UI: do you want to know how to add another chain in your metaMask
    // openAI question: list how to add another block chain in your metaMask 4-1
    addChain: {
      on: {
        YES: {
          target: "addChainInfor",
        },
        NO: {
          target: "final",
        },
      },
      tags: ["Do you want to know how to add a new chain?"],
    },
    addChainInfor: {
      on: {
        NEXT: "final",
      },
      tags: [
        "Do you want to know how to add a new chain?",
        "how to add a new chain on metamask? Give me the answer in 5 bullet points. Limit word count to 100/200.",
      ],
    },
    final: {
      type: "final",
      tags: ["You could sign in with lens now!"],
    },
  },
});

const tutorialService = interpret(tutorialMachine);

export { tutorialMachine, tutorialService };
