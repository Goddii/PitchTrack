import {useEffect, useState } from "react";
import { ArroeRight } from "lucide-react"
import { link } from "react-router-dom"
import Nvabar from "./Navbar"


export default function Hero( {bgImage="/hero-pitch.jpg"}) {
    const [minute, setMinute] =  useState(1)


    useEffect(() => {
        const interval = setInterval(() => {
            setMinute((prev) => (prev >= 90 ? 1 : prev + 1))
        }, 2000);
        return () => clearInterval(interval)
    }, []);

    return (
        <section className="relative w-full h-screen min-h-[640px] overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center"
            style = {{ backgroundImage: `url('${bgImage}')`}}
            role="img"
            aria-label="Football pitch under floodlights"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-night/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-transparent" />

            <Navbar transparent />

            <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10 max-w-3xl">
                <div className="flex items-center gap-3 mb-6 font-body text-sm text-chalk/80">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-floodlight/40 bg-floodlight/10">
                        <span className="w-2 h-2 rounded-full bg-floodlight animate-pulse" />
                        <span className="uppercase tracking-widest2 text-floodlight text-xs font-semibold">
                            Live
                        </span>
                    </span>
                    <span className="font-display tabular-nums tracking-wide"> 
                        {minute}
                    </span>
                    <span className="text-chalk/40">.</span>
                    <span>Matchday tracking, right now</span>

                    <h1 className="font-display  font-bold uppercase text-5xl md:text-7xl leadinf-[0.95] text-chalk">
                        Your League
                        <br />
                        Your Team
                        <br />
                        <span className="text-floodlight">Your Momment. </span> 

                    </h1>

                    <p className="font-body text-chalk/70 text-base md:text-lg mt-6 max-w-md">
                    Track every match, every player, every lagacy - all in one place
                    </p>

                    <div className="flex flex-wrap gap-4 mt-9">
                        <Link 
                        to="/register"
                        className="inline-flex items-center gap-2 bg-floodlight text-night font-body font-semibold px-6 py-3 rounded hover:bg-chalk transition-color"
                        >
                            Get Started
                            <ArrowRight size={18} />
                        
                        </Link>
                        <Link 
                        to="/teams"
                        className="inline-flex items-center gap-2 border border-chalk/40 text-chalk font-body px-6 py-3 rounded hover:border-floodlight hover:text-floodlight transition-colors"
                        >
                            Browse Teams

                        </Link>

                    </div>
                </div>

        </section>
    )
}