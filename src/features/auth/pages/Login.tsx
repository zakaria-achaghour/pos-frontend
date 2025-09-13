import { FormEvent, useState } from "react";
import { login } from "../../../app/auth";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await login(username, password);
    window.location.href = "/";
  }

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded border p-4">
        <h1 className="text-lg font-semibold">Login</h1>
        <input className="w-full rounded border p-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="rounded bg-black px-3 py-2 text-white">Sign In</button>
      </form>
    </div>
  );
}

