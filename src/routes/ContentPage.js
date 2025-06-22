// filepath: src/routes/ContentPage.js
import React, { useEffect, useState } from 'react';
import './ContentPage.css';

const HOST = process.env.REACT_APP_HOST;
const APP_KEY = process.env.REACT_APP_APP_KEY;
const APP_TOKEN = process.env.REACT_APP_APP_TOKEN;
// const TIMEOUT_MS = 8000; // 8 seconds

export default function ContentPage() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(`${HOST}/api/lessons`, {
      headers: {
        "x-conveyour-appkey": APP_KEY,
        "x-conveyour-token": APP_TOKEN,
      },
    })
      .then((res) => {
        console.log("Fetch response:", res);
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        console.log("Fetch data:", data);
        setContent(data); // Save the whole response object
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contents-container">
      <h1>Lessons</h1>
      <table className="contents-table">
        <thead>
          <tr>
            <th>Lesson Name</th>
            <th>Lesson UUID</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(content.data) &&
            content.data.map((lesson, idx) => (
              <tr key={lesson.uuid || idx}>
                <td>
                  <a
                    href={`${HOST}/lessons/edit/${lesson.uuid}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lesson.name}
                  </a>
                </td>
                <td>{lesson.uuid}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* <div>
        <h2>Full Response</h2>
        <pre>{JSON.stringify(content, null, 2)}</pre>
      </div> */}
    </div>
  );
}