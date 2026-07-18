import { useState } from 'react';
import Navbar from '../components/Navbar';


export default function Home() {

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-emerald-500 selection:text-zinc-950">
            <Navbar />

            <header className="relative relative-box overflow-hidden border-b border-zinc-900 py-24 sm:py-32 bg-zinc-950">
                <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-900/15 rounded-full blur-[120px] pointer-events-none'></div>
                <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-950/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 bg-emerald-950/50 border border-emerald-800/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wider      uppercase mb-6 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Hub Dashboard
                    </div>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-3xl leading-[1.1] mb-6">
                    TRACK YOUR <br /> LEAGUE.<br />FOLLOW YOUR <br />TEAM.
                </h1>

                <p className="text-zinc-400 text-lg sm:text-xl max-w-xl mb-10 font-normal">
                    Manage teams, players & fixtures in one place
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"></div>    

            </header>
            

        </div>
    )
}

