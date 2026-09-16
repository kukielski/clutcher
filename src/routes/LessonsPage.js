import React, { useEffect, useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import './ContentPage.css';
import './LessonPage.css';

export default function LessonsPage() {
    const { host, token } = useContext(AuthContext);
    const { search = "" } = useOutletContext() || {};
    const { lessons: cached, ensureLoaded } = useCache();
    const { items: lessons, status, error } = cached;

    useEffect(() => {
        document.title = "Lessons";
    }, []);

    useEffect(() => {
        if (!host || !token) return;
        ensureLoaded("lessons");
    }, [host, token, ensureLoaded]);

    if (!host || !token) {
        return <p className="status-msg">Add your domain and API token in <Link to="/settings">Settings</Link> to load this list.</p>;
    }

    if ((status === "idle" || status === "loading") && lessons.length === 0) return <p className="status-msg">Loading…</p>;

    if (error && lessons.length === 0) return <p className="status-msg">Error: {error}</p>;

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

    const lessonsByTeam = {};
    filteredLessons.forEach(lesson => {
        if (!lessonsByTeam[lesson.teamLabel]) {
            lessonsByTeam[lesson.teamLabel] = [];
        }
        lessonsByTeam[lesson.teamLabel].push(lesson);
    });

    return (
        <div className="list-page">
            {filteredLessons.length === 0 ? (
                <p className="empty-state">No lessons match your search.</p>
            ) : (
                Object.entries(lessonsByTeam).map(([teamLabel, teamLessons]) => (
                    <section key={teamLabel} className="team-section">
                        <h3 className="team-heading">
                            {teamLabel}
                            {teamLessons[0].teamId ? (
                                <span>
                                    (<a
                                        href={`${host}/settings/teams/${teamLessons[0].teamId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {teamLessons[0].teamId}
                                    </a>)
                                </span>
                            ) : null}
                            <span className="team-count">
                                — {teamLessons.length} Lesson{teamLessons.length !== 1 ? 's' : ''}
                            </span>
                        </h3>
                        <table className="lesson-table item-table">
                            <thead>
                                <tr>
                                    <th>Lesson name</th>
                                    <th>Lesson ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamLessons.map((lesson, idx) => (
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
                        <div className="item-cards">
                            {teamLessons.map((lesson, idx) => (
                                <article
                                    key={`${lesson.teamId || "no-team"}-${lesson.uuid || idx}`}
                                    className="item-card"
                                >
                                    <Link className="item-card-title" to={`/content/lessons/${lesson.id}`}>
                                        {lesson.name}
                                    </Link>
                                    <dl className="item-card-meta">
                                        <div>
                                            <dt>ID</dt>
                                            <dd>
                                                <a
                                                    href={`${host}/lessons/edit/${lesson.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {lesson.id}
                                                </a>
                                            </dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    );
}
