"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { LetterNote } from "@/components/LetterNote";
import { Flower2, Heart } from "lucide-react";
import Link from "next/link"; // better for Next routing vs 'a' href

// The shape of the decoded data from URL
interface SharedNote {
  r: string; // recipient
  m: string; // message
  f: string[]; // flowers
  s: string; // stamp
  e?: any[]; // animatedEmojis
}

function NoteFetcher() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const encodedData = searchParams.get("d");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [noteData, setNoteData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let foundNote = null;

    // 1. Try to check local storage for full note (captures the doodle if checking on same device!)
    try {
      const saved = JSON.parse(localStorage.getItem("flower-notes-saved") || "[]");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localMatch = saved.find((n: any) => n.id === id);
      if (localMatch) {
        foundNote = {
          recipient: localMatch.recipient,
          message: localMatch.message,
          flowers: localMatch.flowers,
          stampEmoji: localMatch.stamp === "heart" ? "💖" : 
                      localMatch.stamp === "star" ? "✨" : 
                      localMatch.stamp === "kiss" ? "💋" : 
                      localMatch.stamp === "gift" ? "🎁" : 
                      localMatch.stamp === "butterfly" ? "🦋" : 
                      localMatch.stamp === "rainbow" ? "🌈" : "💖",
          isPublic: localMatch.isPublic,
          drawingUrl: localMatch.drawingUrl,
          animatedEmojis: localMatch.animatedEmojis,
        };
      }
    } catch(e) {}

    // 2. If no local match, try URL decoding (this usually happens if the link is sent to someone's phone)
    if (!foundNote && encodedData) {
      try {
        const decodedString = decodeURIComponent(atob(encodedData));
        const payload: SharedNote = JSON.parse(decodedString);
        foundNote = {
          recipient: payload.r,
          message: payload.m,
          flowers: payload.f,
          stampEmoji: payload.s === "heart" ? "💖" : 
                      payload.s === "star" ? "✨" : 
                      payload.s === "kiss" ? "💋" : 
                      payload.s === "gift" ? "🎁" : 
                      payload.s === "butterfly" ? "🦋" : 
                      payload.s === "rainbow" ? "🌈" : "💖",
          isPublic: true, 
          animatedEmojis: payload.e,
        };
      } catch (e) {
        console.error("Failed to decode URL note", e);
      }
    }

    if (foundNote) {
      setNoteData(foundNote);
    }
    setLoading(false);
  }, [id, encodedData]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[100dvh]">
        <Flower2 className="animate-spin text-[#14b8a6] mb-4" size={40} />
      </div>
    );
  }

  if (!noteData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center p-6 bg-slate-50">
        <div className="w-24 h-24 bg-white shadow-xl rounded-[28px] border border-slate-100 flex items-center justify-center mb-6">
          <Heart className="text-slate-200 w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-3">Note not found</h1>
        <p className="text-slate-500 max-w-sm mx-auto mb-8 font-medium">
          The note you're looking for might have wilted or the link is broken.
        </p>
        <Link href="/" className="bg-gradient-to-r from-[#0f766e] to-[#14b8a6] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all shadow-md">
          Create a new note
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative bg-slate-50 overflow-hidden">
      {/* Magical Background Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#14b8a6]/15 to-transparent blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-[#e11d48]/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-purple-500/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="w-full relative z-10 px-4 py-12 flex justify-center perspective-1000">
        <LetterNote
          recipient={noteData.recipient}
          message={noteData.message}
          flowers={noteData.flowers}
          stampEmoji={noteData.stampEmoji}
          isPublic={noteData.isPublic}
          drawingUrl={noteData.drawingUrl}
          animatedEmojis={noteData.animatedEmojis}
        />
      </div>
      
      <div className="absolute bottom-6 left-0 w-full text-center z-50">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-[#0f766e] transition-colors inline-flex bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-sm">
            Create your own FlowerNote
          </Link>
      </div>
    </div>
  );
}

export default function NotePage() {
  return (
    <Suspense fallback={
       <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
         <Flower2 className="animate-spin text-[#14b8a6] mb-4" size={40} />
       </div>
    }>
      <NoteFetcher />
    </Suspense>
  );
}
