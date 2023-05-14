import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

import { tutorialMachine, tutorialService } from "~/lib/state-machine.server";
import { useLoaderData, useNavigate, useNavigation } from "@remix-run/react";
import openAI from "~/lib/open-ai.server";
import React from "react";

export const meta: V2_MetaFunction = () => [{ title: "Clarity" }];

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const step = url.searchParams.get("stepName");
  const branch = url.searchParams.get("branch");
  if (!step) {
    const { initialState } = tutorialService;
    return json({
      state: initialState,
      branches: ["YES", "NO"],
      answer: "",
    });
  } else {
    const nextState = await tutorialMachine.transition(step, {
      type: branch ?? "",
    });
    const question =
      nextState.tags.size > 1 ? Array.from(nextState.tags)[1] : null;
    let answer = "";
    if (question) {
      const answerRes = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
      });
      answer = answerRes.data.choices[0].message?.content ?? "";
    }
    const rawResolver = nextState.configuration[0].config.on;
    const branches = rawResolver != null ? Object.keys(rawResolver) : [];
    return json({ state: nextState, branches, answer });
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const {
    state: { value, tags },
    branches,
    answer,
  } = data;
  const navigate = useNavigate();
  const transition = useNavigation();
  const splitAnswer = answer.split(/\d{1,2}(\.)/).filter((ans) => {
    const includeNumber = "1234567890".includes(ans);
    return !includeNumber && ans.length > 1;
  });
  const generateUrl = () => {
    const names = ["nonce", "web3", "coool", "cute", "random", "ai", "robot"];
    const randomPick = (size: number) => Math.floor(Math.random() * size);
    const name = randomPick(names.length);
    const [body, head, accessory] = [29, 233, 136].map((cur) => {
      const index = randomPick(cur);
      return index;
    });
    const query = `https://noun-api.com/beta/pfp?name=${name}&head=${head}&body=${body}&accessory=${accessory}&size=240`;
    return query;
  };
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white">
      <p className="h-[80px] w-[460px] bg-[#cce5e6] text-center font-semibold leading-[80px]">
        Mumbai
      </p>
      <div className="flex h-[668px] w-[460px] flex-col items-center justify-center bg-[#f2e6f7]">
        {transition.state === "idle" && value.toString() !== "final" ? (
          <form method="get">
            <p>
              <label className="mb-3 mt-2 w-[320px] font-grotesk text-xl">
                {tags[0]}
              </label>
              <input
                type="hidden"
                name="stepName"
                className="display:none"
                defaultValue={value.toString()}
              />
              {branches.length == 1 ? (
                <input
                  className="hidden"
                  type="radio"
                  id={branches[0]}
                  name="branch"
                  value={branches[0]}
                  defaultChecked
                />
              ) : (
                <></>
              )}
            </p>
            {answer === "" ? (
              <img
                src={generateUrl()}
                alt="dynamic-icon-in-question"
                className="mx-auto block"
              />
            ) : (
              <></>
            )}
            {splitAnswer.map((ans, index) => (
              <p className="mt-1 w-[320px] font-grotesk" key={index}>
                {ans}
              </p>
            ))}

            <div className="my-5 flex w-[320px] flex-row justify-between">
              {branches.length > 1 &&
                branches.map((branch) => (
                  <div key={branch}>
                    <label
                      className={`block h-12 w-12 rounded-md border-slate-800 bg-white text-center font-grotesk leading-[48px] shadow-md shadow-slate-950 hover:cursor-pointer ${
                        selected == branch ? "text-pink-700" : "text-black"
                      }`}
                      htmlFor={branch}
                      onClick={(e) => {
                        setSelected(branch);
                      }}
                    >
                      <input
                        className="hidden"
                        type="radio"
                        id={branch}
                        name="branch"
                        value={branch}
                      />
                      {branch}
                    </label>
                  </div>
                ))}
            </div>
            <p>
              <button
                type="submit"
                className="mt-3 w-24 rounded-lg bg-slate-700 text-white"
              >
                Next
              </button>
            </p>
          </form>
        ) : (
          <div className="mx-auto flex w-[320px] flex-col">
            Congratulations! You have now completed the onboarding process.
            <button
              className="mt-3 w-24 rounded-lg bg-slate-700 text-white"
              onClick={(e) => {
                navigate("/login");
              }}
            >
              Next
            </button>
          </div>
        )}
        {transition.state === "loading" ? <p>Waiting ......</p> : <></>}
      </div>
    </main>
  );
}
