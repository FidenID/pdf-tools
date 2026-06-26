"use client";
import { useState } from "react";
import { Lock, Unlock, Loader2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";

function EncryptForm() {
  const [file, setFile] = useState<File | null>(null);
  const [userPw, setUserPw] = useState("");
  const [ownerPw, setOwnerPw] = useState("");
  const [bits, setBits] = useState("128");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!file || !userPw) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("userPassword", userPw);
    form.append("ownerPassword", ownerPw || userPw);
    form.append("bits", bits);
    const res = await fetch("/api/pdf/encrypt", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "_encrypted.pdf");
      a.click();
    } else {
      const data = await res.json();
      setError(data.error + (data.hint ? ` — ${data.hint}` : ""));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop PDF here" />
      {file && <div className="text-sm text-gray-400">{file.name}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-400 block mb-1">User Password *</label>
          <input value={userPw} onChange={e => setUserPw(e.target.value)} type="password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            placeholder="Required to open PDF" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Owner Password</label>
          <input value={ownerPw} onChange={e => setOwnerPw(e.target.value)} type="password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            placeholder="Defaults to user pw" />
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-400 block mb-1">Encryption</label>
        <select value={bits} onChange={e => setBits(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
          <option value="128">128-bit (AES)</option>
          <option value="256">256-bit (AES-256)</option>
        </select>
      </div>
      {error && <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={run} disabled={!file || !userPw || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
        {loading ? "Encrypting..." : "Encrypt PDF"}
      </button>
    </div>
  );
}

function DecryptForm() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = async () => {
    if (!file || !password) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    form.append("password", password);
    const res = await fetch("/api/pdf/decrypt", { method: "POST", body: form });
    if (res.ok) {
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(".pdf", "_decrypted.pdf");
      a.click();
    } else {
      const data = await res.json();
      setError(data.error + (data.hint ? ` — ${data.hint}` : ""));
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <FileDropzone onFiles={f => setFile(f[0])} accept=".pdf" label="Drop encrypted PDF here" />
      {file && <div className="text-sm text-gray-400">{file.name}</div>}
      <div>
        <label className="text-sm text-gray-400 block mb-1">Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          placeholder="Enter PDF password" />
      </div>
      {error && <div className="text-red-400 text-sm bg-red-900/20 rounded-lg p-3">{error}</div>}
      <button onClick={run} disabled={!file || !password || loading}
        className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 rounded-lg py-2.5 font-medium flex items-center justify-center gap-2">
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Unlock size={18} />}
        {loading ? "Decrypting..." : "Decrypt PDF"}
      </button>
    </div>
  );
}

export default function PdfEncrypt() {
  const [tab, setTab] = useState<"encrypt" | "decrypt">("encrypt");
  return (
    <ToolCard title="PDF Encryption" description="Password-protect or unlock PDF files" icon={<Lock size={22} />}>
      <div className="flex gap-2 mb-4">
        {(["encrypt", "decrypt"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
            }`}>{t}</button>
        ))}
      </div>
      {tab === "encrypt" ? <EncryptForm /> : <DecryptForm />}
    </ToolCard>
  );
}
