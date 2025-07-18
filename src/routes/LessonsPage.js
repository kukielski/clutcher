import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './ContentPage.css';
import './LessonPage.css';

const APP_KEY = process.env.REACT_APP_APP_KEY;

export default function LessonsPage() {
    const { host, token } = useContext(AuthContext);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    // Set the browser tab title
    useEffect(() => {
        document.title = "Lessons";
    }, []);

    useEffect(() => {
        if (!host || !token) return;
        async function fetchAll() {
            try {
                const teamsRes = await fetch(`${host}/api/teams`, {
                    headers: {
                        "x-conveyour-appkey": APP_KEY,
                        "x-conveyour-token": token,
                    },
                });
                if (!teamsRes.ok) throw new Error("Failed to fetch teams");
                const teamsData = await teamsRes.json();
                const teams = Array.isArray(teamsData.data) ? teamsData.data : [];

                const lessonFetches = [
                    fetch(`${host}/api/lessons`, {
                        headers: {
                            "x-conveyour-appkey": APP_KEY,
                            "x-conveyour-token": token,
                        },
                    }).then(res => res.json()).then(data => ({
                        teamLabel: "No Team",
                        teamId: null,
                        lessons: Array.isArray(data.data) ? data.data : [],
                    })),
                    ...teams.map(team => {
                        return fetch(`${host}/api/lessons?teams=${team.id}`, {
                            headers: {
                                "x-conveyour-appkey": APP_KEY,
                                "x-conveyour-token": token,
                            },
                        })
                            .then(res => res.json())
                            .then(data => ({
                                teamLabel: team.label,
                                teamId: team.id,
                                lessons: Array.isArray(data.data) ? data.data : [],
                            }))
                    }),
                ];

                const allLessonsByTeam = await Promise.all(lessonFetches);

                const allLessons = allLessonsByTeam.flatMap(({ teamLabel, teamId, lessons }) =>
                    lessons.map(lesson => ({
                        ...lesson,
                        teamLabel,
                        teamId,
                    }))
                );

                setLessons(allLessons);
                setLoading(false);
            } catch (err) {
                setError(err); // This will now work
                setLoading(false);
            }
        }

        fetchAll();
    }, [host, token, setError]);

    if (!host || !token) {
        return <div>Please reload and enter your domain and APP_TOKEN.</div>;
    }

    if (loading) return <div style={{ margin: "1rem" }}>Loading...</div>;

    if (error) return <div>Error: {error.message}</div>;

    const sortedLessons = [...lessons].sort((a, b) => {
        if (a.teamLabel === "No Team" && b.teamLabel !== "No Team") return -1;
        if (a.teamLabel !== "No Team" && b.teamLabel === "No Team") return 1;
        const teamCompare = (a.teamLabel || '').localeCompare(b.teamLabel || '');
        if (teamCompare !== 0) return teamCompare;
        return (a.name || '').localeCompare(b.name || '');
    });

    const filteredLessons = sortedLessons.filter(
        lesson =>
            lesson.name.toLowerCase().includes(search.toLowerCase()) ||
            (lesson.teamLabel && lesson.teamLabel.toLowerCase().includes(search.toLowerCase())) ||
            (lesson.id && lesson.id.toString().toLowerCase().includes(search.toLowerCase()))
    );

    // Group lessons by teamLabel
    const lessonsByTeam = {};
    filteredLessons.forEach(lesson => {
        if (!lessonsByTeam[lesson.teamLabel]) {
            lessonsByTeam[lesson.teamLabel] = [];
        }
        lessonsByTeam[lesson.teamLabel].push(lesson);
    });

    return (
        <div style={{ marginTop: "1rem" }}>
            <input
                type="text"
                placeholder="Search name, team, or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
            />
            {Object.entries(lessonsByTeam).map(([teamLabel, lessons]) => (
                <div key={teamLabel} style={{ marginBottom: "2rem" }}>
                    <h3 style={{ marginBottom: "1rem" , fontSize: "1.35rem" }}>
                        {teamLabel} {lessons[0].teamId ? `(${lessons[0].teamId})` : ""}
                    </h3>
                    <table className="lesson-table">
                        <thead>
                            <tr>
                                <th style={{ paddingRight: "10px" }}>LESSON NAME</th>
                                <th style={{ paddingLeft: "10px", textAlign: "left" }}>LESSON ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lessons.map((lesson, idx) => (
                                <tr key={`${lesson.teamId || "no-team"}-${lesson.uuid || idx}`}>
                                    <td>
                                        <Link to={`/content/lessons/${lesson.id}`}>{lesson.name}</Link>
                                    </td>
                                    <td>
                                        <a
                                            href={`${host}/lessons/edit/${lesson.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {lesson.id}
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}