import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LessonPage.css';

const APP_KEY = process.env.REACT_APP_APP_KEY;

// Types that should use the question/name/title logic
const SHOW_LABEL_TYPES = [
  "scorm",
  "challenge",
  "open_ended",
  "blank",
  "missing_words",
  "order",
  "assessment",
  "video_upload",
  "poll",
  "checklist"
];

export default function LessonPage() {
  const { host, token } = useContext(AuthContext);
  const { lessonId } = useParams();
  const [items, setItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`${host}/api/lessons/${lessonId}`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch lesson");
        const data = await res.json();
        setItems(Array.isArray(data.data?.items) ? data.data.items : []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
    fetchLesson();
  }, [lessonId, host, token]);

  if (loading) return <div style={{ margin: "1rem" }}>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  function truncateLabel(label) {
    if (typeof label !== 'string') return label;
    return label.length > 50 ? label.slice(0, 47) + '...' : label;
  }

  function getLabel(item) {
    if (SHOW_LABEL_TYPES.includes(item.type)) {
      if (item.values?.question) return truncateLabel(item.values.question);
      if (item.question) return truncateLabel(item.question);
      if (item.values?.name) return truncateLabel(item.values.name);
      if (item.name) return truncateLabel(item.name);
      if (item.values?.title) return truncateLabel(item.values.title);
      if (item.title) return truncateLabel(item.title);
      return <em>{item.type}</em>;
    }
    if (item.type === "rich_text") {
      if (item.values?.body && item.values.body.trim().length > 0) {
        return truncateLabel(item.values.body);
      }
      return <em>No rich_text content</em>;
    }
    if (item.type === "video") {
      if (item.values?.summary?.title) {
        return truncateLabel(item.values.summary.title);
      }
      return <em>Video content removed</em>;
    }
    if (item.type === "audio") {
      if (item.values?.audio) {
        return "Audio file uploaded";
      }
      return <em>No audio content</em>;
    }
    if (item.type === "files") {
      if (Array.isArray(item.values?.files) && item.values.files.length > 0) {
        return "Files are being used";
      }
      return <em>No files</em>;
    }
    if (item.type === "stats_tracker") {
      if (Array.isArray(item.values?.questions) && item.values.questions.length > 0 && item.values.questions[0].question) {
        return truncateLabel(item.values.questions[0].question);
      }
      return <em>No stats_tracker content</em>;
    }
    if (item.type === "cal") {
      if (item.values?.url) {
        return truncateLabel(item.values.url);
      }
      return <em>No Cal link</em>;
    }
    if (item.type === "calendly") {
      if (item.values?.calendly_url) {
        return truncateLabel(item.values.calendly_url);
      }
      return <em>No Calendly link</em>;
    }
    if (item.type === "contact_updates") {
      if (item.values?.question) {
        return truncateLabel(item.values.question);
      }
      if (
        Array.isArray(item.values?.contact_fields) &&
        item.values.contact_fields.length > 0 &&
        item.values.contact_fields[0].contact_field
      ) {
        return truncateLabel(item.values.contact_fields[0].contact_field);
      }
      return <em>No contact_updates content</em>;
    }
    if (item.type === "jotform" || item.type === "typeform") {
      if (item.values?.form_id) {
        return truncateLabel("Form: " + item.values.form_id);
      }
      return <em>No {item.type} linked</em>;
    }
    if (item.type === "signwell") {
      if (item.values?.template_id) {
        return truncateLabel("Template: " + item.values.template_id);
      }
      return <em>No SignWell Template linked</em>;
    }
    if (item.type === "contact_update") {
      if (item.values?.question) {
        return truncateLabel(item.values.question);
      }
      return <em>No contact_update content</em>;
    }
    if (item.type === "button") {
      if (item.values?.url) {
        return truncateLabel("Button link: " + item.values.url);
      }
      return <em>No button link</em>;
    }
    if (item.type === "embed") {
      if (item.values?.url) {
        return truncateLabel("Embeded link: " + item.values.url);
      }
      return <em>No embed link</em>;
    }
    if (item.type === "social") {
      if (item.values?.body) {
        return truncateLabel(item.values.body);
      }
      return <em>No social post</em>;
    }
    if (item.type === "custom") {
      if (item.values?.url) {
        return truncateLabel(item.values.url);
      }
      return <em>No custom link</em>;
    }
    return <em>{item.type}</em>;
  }

  // Click handler for the type name
  const handleTypeClick = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1200);
  };

  return (
    <div>
      <h2>Lesson Details</h2>
      <p>Lesson ID: {lessonId}</p>
      <table className="lesson-table">
        <thead>
          <tr>
            <th style={{ paddingRight: "10px" }}>TYPE</th>
            <th style={{ paddingLeft: "10px", textAlign: "left" }}>LESSON ITEM</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.uuid}>
              <td style={{ paddingRight: "10px" }}>
                <span
                  className="type-tooltip"
                  tabIndex={0}
                  onClick={() => handleTypeClick(item.uuid)}
                  style={{ cursor: "pointer" }}
                >
                  {item.type}
                  <span className="tooltip-content">
                    {copiedId === item.uuid ? "Copied ID to clipboard!" : item.uuid}
                  </span>
                </span>
              </td>
              <td style={{ paddingLeft: "10px", textAlign: "left" }}>{getLabel(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}