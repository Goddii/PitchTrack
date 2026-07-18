import { useState } from "react";
import Hero from "../components/Hero";


export default function Home() {
    const [teams, setTeams] = useState([])
    const [matches, setMatches] = useState([])

    return (
        <div>
            <Hero />
        </div>
    )
}