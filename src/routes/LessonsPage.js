import React, { useEffect, useState } from 'react';
import './ContentPage.css';

const HOST = process.env.REACT_APP_HOST;
const APP_KEY = process.env.REACT_APP_APP_KEY;
const APP_TOKEN = process.env.REACT_APP_APP_TOKEN;

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const teamsRes = await fetch(`${HOST}/api/teams`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": APP_TOKEN,
          },
        });
        if (!teamsRes.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsRes.json();
        const teams = Array.isArray(teamsData.data) ? teamsData.data : [];

        const lessonFetches = [
          fetch(`${HOST}/api/lessons`, {
            headers: {
              "x-conveyour-appkey": APP_KEY,
              "x-conveyour-token": APP_TOKEN,
            },
          }).then(res => res.json()).then(data => ({
            teamLabel: "No Team",
            teamId: null,
            lessons: Array.isArray(data.data) ? data.data : [],
          })),
          ...teams.map(team => {
            return fetch(`${HOST}/api/lessons?teams=${team.id}`, {
              headers: {
                "x-conveyour-appkey": APP_KEY,
                "x-conveyour-token": APP_TOKEN,
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
        setError(err.message);
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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
      (lesson.teamLabel && lesson.teamLabel.toLowerCase().includes(search.toLowerCase()))
  );

  let lastTeam = null;
  const rows = [];
  filteredLessons.forEach((lesson, idx) => {
    if (lesson.teamLabel !== lastTeam) {
      rows.push(
        <tr key={`team-${lesson.teamLabel}`}>
          <td colSpan="3" style={{ background: "#f0f0f0", fontWeight: "bold", textAlign: "center" }}>
            {lesson.teamLabel} {lesson.teamId ? `(${lesson.teamId})` : ""}
          </td>
        </tr>
      );
      lastTeam = lesson.teamLabel;
    }
    rows.push(
      <tr key={`${lesson.teamId || "no-team"}-${lesson.uuid || idx}`}>
        <td>
          <a
            href={`${HOST}/lessons/edit/${lesson.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {lesson.name}
          </a>
        </td>
        <td>{lesson.id}</td>
      </tr>
    );
  });

  return (
    <div>
      <h2>Lessons by Team</h2>
      <input
        type="text"
        placeholder="Search lessons or teams..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />
      <table>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}