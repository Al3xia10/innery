"use client";
import Image from "next/image";

export default function HowItWorks() {
    return (
        <section className="relative w-full overflow-hidden bg-indigo-500">
            {/* WAVE */}
  <svg
    viewBox="0 0 1200 200"
    preserveAspectRatio="none"
    className="absolute -top-1 left-0 w-full h-36"
  >
    <path
      d="
        M0,80
        C200,20 400,20 600,60
        C800,100 1000,120 1200,60
        L1200,0
        L0,0
        Z
      "
      fill="#FAD2C8"
    />
  </svg>
          <div className="relative z-20 mx-auto max-w-6xl px-6 py-24 text-center text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* LEFT – TEXT */}
            <div className="w-full flex justify-center md:mt-10">
            <Image
               src="/poza-therapist.png"
               alt="Therapy illustration"
               width={650}
               height={650}
               className="object-contain"
               priority
                          />
            </div>
            {/* RIGHT – TEXT */}
            <div className="relative space-y-6 px-4">
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
                    How Innery works
                </h2>
                <p className="text-sm md:text-base text-white/70 leading-relaxed max-w-md">
  A simple workflow for documenting care, staying organized, and supporting clients between sessions.
</p>
                <ul className="mt-6 space-y-5 text-left max-w-md">
                  <li className="flex gap-4">
                    <span className="mt-1 w-6 h-6 rounded-full bg-white/15 text-sm font-semibold flex items-center justify-center">
                      1
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Create a private workspace per client for notes, sessions, and key context.
                    </p>
                  </li>

                  <li className="flex gap-4">
                    <span className="mt-1 w-6 h-6 rounded-full bg-white/15 text-sm font-semibold flex items-center justify-center">
                      2
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Capture session notes in a consistent structure so progress is easy to review.
                    </p>
                  </li>

                  <li className="flex gap-4">
                    <span className="mt-1 w-6 h-6 rounded-full bg-white/15 text-sm font-semibold flex items-center justify-center">
                      3
                    </span>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Use reflections and follow-ups between sessions to keep momentum and clarity.
                    </p>
                  </li>
                </ul>
            </div>
            </div>
            </div> 
      
        </section>
    
    )
}