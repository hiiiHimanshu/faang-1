"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { useAuth } from "@/providers/auth-provider";
import { apiFetch } from "@/lib/api-client";

export default function CsvUploadButton() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { idToken } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !idToken) {
      return;
    }

    setStatus("loading");
    setMessage("");

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = results.data.filter((row) =>
            Object.values(row).some((value) => value && value.trim() !== ""),
          );
          await apiFetch(
            "/transactions/upload",
            "POST",
            { rows },
            { token: idToken },
          );
          setStatus("success");
          setMessage(`Imported ${rows.length} transactions`);
        } catch (error) {
          console.error("CSV upload failed", error);
          setStatus("error");
          setMessage("Upload failed. Please try again.");
        } finally {
          event.target.value = "";
        }
      },
      error: (error) => {
        console.error("CSV parse error", error);
        setStatus("error");
        setMessage("Could not parse CSV file.");
        event.target.value = "";
      },
    });
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
      >
        Upload CSV
      </button>
      {status === "loading" && <span className="text-xs text-slate-400">Uploading…</span>}
      {status === "success" && (
        <span className="text-xs text-emerald-400">{message}</span>
      )}
      {status === "error" && <span className="text-xs text-rose-400">{message}</span>}
    </div>
  );
}
