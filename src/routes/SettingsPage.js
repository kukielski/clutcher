import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./SettingsPage.css";

const APP_KEY = process.env.REACT_APP_APP_KEY;

function domainFromHost(host) {
  if (!host) return "";
  return host.replace(/^https?:\/\//, "").replace(/\.conveyour\.com\/?$/, "");
}

function orgLabel(data) {
  const org = data?.data ?? data;
  return org?.name || org?.label || org?.title || org?.domain || "";
}

export default function SettingsPage() {
  const { host, token, saveCredentials, clearCredentials } = useContext(AuthContext);
  const [domainInput, setDomainInput] = useState(() => domainFromHost(host));
  const [tokenInput, setTokenInput] = useState("");
  const [status, setStatus] = useState(host && token ? "checking" : "idle");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState("");
  const skipNextCheck = useRef(false);

  useEffect(() => {
    document.title = "Settings";
  }, []);

  useEffect(() => {
    if (skipNextCheck.current) {
      skipNextCheck.current = false;
      return;
    }

    if (!host || !token) {
      setStatus("idle");
      setOrgName("");
      return;
    }

    let cancelled = false;

    async function checkSaved() {
      setStatus("checking");
      setError("");
      try {
        const res = await fetch(`${host}/api/org`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        });
        if (!res.ok) throw new Error("Could not connect");
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (cancelled) return;
        setOrgName(orgLabel(data));
        setStatus("connected");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setError("Could not connect with the saved credentials. Check the domain and API token.");
      }
    }

    checkSaved();
    return () => {
      cancelled = true;
    };
  }, [host, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const domain = domainInput.trim().toLowerCase();
    const domainRegex = /^[a-z0-9-]+$/;
    if (!domainRegex.test(domain)) {
      setStatus("error");
      setError("Invalid domain. Use only letters, numbers, and hyphens.");
      return;
    }

    const nextToken = tokenInput.trim() || token;
    if (!nextToken) {
      setStatus("error");
      setError("Enter an API token.");
      return;
    }

    const fullHost = `https://${domain}.conveyour.com`;
    setStatus("checking");
    setError("");

    try {
      const res = await fetch(`${fullHost}/api/org`, {
        headers: {
          "x-conveyour-appkey": APP_KEY,
          "x-conveyour-token": nextToken,
        },
      });
      if (!res.ok) throw new Error("Could not connect");
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      skipNextCheck.current = true;
      saveCredentials(fullHost, nextToken);
      setOrgName(orgLabel(data));
      setTokenInput("");
      setStatus("connected");
    } catch {
      setStatus("error");
      setError("Could not connect. Check the domain and API token.");
    }
  };

  const handleDisconnect = () => {
    clearCredentials();
    setTokenInput("");
    setOrgName("");
    setError("");
    setStatus("idle");
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <p className="settings-lead">
        Connect Clutcher with a ConveYour domain and Zapier API token.
      </p>

      <div className={`status-banner status-banner--${status}`} role="status" aria-live="polite">
        {status === "checking" && "Checking connection…"}
        {status === "connected" && (
          orgName ? `You're connected to ${orgName}.` : "You're connected!"
        )}
        {status === "error" && error}
        {status === "idle" && "Not connected yet."}
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        <label className="auth-field">
          Domain
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            placeholder="bard"
            title="Only letters, numbers, and hyphens"
          />
          <span className="auth-hint">Letters, numbers, and hyphens only</span>
        </label>
        <label className="auth-field">
          API token
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            autoComplete="off"
            required={!token}
            placeholder={token ? "Saved — enter a new token to update" : ""}
          />
        </label>
        <div className="auth-actions">
          <button type="submit" className="auth-submit" disabled={status === "checking"}>
            {status === "checking" ? "Connecting…" : token ? "Update connection" : "Connect"}
          </button>
          {token ? (
            <button type="button" className="auth-cancel" onClick={handleDisconnect}>
              Disconnect
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
