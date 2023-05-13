import type { V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

export const meta: V2_MetaFunction = () => [{ title: "Clarity" }];

export async function loader() {
  const names = ["nonce", "web3", "coool", "cute", "random", "ai", "robot"];

  const randomPick = (size: number) => Math.floor(Math.random() * size);
  const name = randomPick(names.length);
  const [body, head, accessory] = [29, 233, 136].map((cur) => {
    const index = randomPick(cur);
    return index;
  });
  return json({ name, body, head, accessory });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { name, head, accessory, body } = data;
  const query = `name=${name}&head=${head}&body=${body}&accessory=${accessory}&size=240`;
  return (
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex h-[668px] w-[460px] flex-col items-center justify-center bg-[#f2e6f7]">
        <img
          src={`https://noun-api.com/beta/pfp?${query}`}
          alt="dynamic-icon"
        />

        <div className="z-10 mt-10 h-14 w-60 self-center justify-self-center rounded-full bg-[#CCE5E6] text-center font-grotesk text-lg font-extrabold leading-[56px] shadow-lg shadow-slate-950">
          Clarity
        </div>

        <div className="static left-0 top-[40px] h-8 w-60 text-center text-sm leading-[32px]">
          Your smart AI asssistant
        </div>

        <div
          className="mt-12 h-8 w-60 rounded-lg bg-white text-center leading-[32px] shadow-lg shadow-slate-950 hover:cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            navigate("/smart");
          }}
        >
          start
        </div>
      </div>
    </main>
  );
}
