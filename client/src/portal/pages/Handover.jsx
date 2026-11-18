import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { portalFetch } from "../api.js";
import { usePortal } from "../auth.jsx";
import Proof from "../Proof.jsx";
import SignaturePad from "../SignaturePad.jsx";

function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function nowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function readPage(file) {
  if (file.type === "application/pdf") {
    if (file.size > 6 * 1024 * 1024) return Promise.reject(new Error("That page must be under 6 MB."));
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("That page could not be read."));
      reader.readAsDataURL(file);
    });
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Use a photo or a PDF of the page."));
    };
    image.src = url;
  });
}

export default function Handover() {
  const { projectId } = useParams();
  const { user } = usePortal();
  const [record, setRecord] = useState(null);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState(nowTime());
  const [nextPerson, setNextPerson] = useState("");
  const [note, setNote] = useState("");
  const [scan, setScan] = useState("");
  const [scanLabel, setScanLabel] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const staffRef = useRef(null);
  const nextRef = useRef(null);
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const prefilled = useRef(false);

  useEffect(() => {
    document.title = "Collection done | HWMC desk";
    let active = true;
    portalFetch(`/api/portal/stops/${projectId}?date=${date}`)
      .then((data) => {
        if (!active) return;
        setRecord(data);
        if (!prefilled.current && data.visit) {
          prefilled.current = true;
          setTime(data.visit.collectedTime || nowTime());
          setNextPerson(data.visit.nextPersonName || "");
          setNote(data.visit.proofNote || "");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [projectId, date, saved]);

  async function onScan(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    try {
      const dataUrl = await readPage(file);
      setScan(dataUrl);
      setScanLabel(file.name);
    } catch (err) {
      setError(err.message);
    }
  }

  async function onSubmit(event) {
    event.preventDefault();
    const staffSignature = staffRef.current?.toDataUrl() || "";
    const nextSignature = nextRef.current?.toDataUrl() || "";
    setBusy(true);
    setError("");
    setSaved("");
    try {
      await portalFetch("/api/portal/handover", {
        method: "POST",
        body: JSON.stringify({
          project: projectId,
          visitDate: date,
          collectedTime: time,
          nextPersonName: nextPerson,
          staffSignature,
          nextSignature,
          scan,
          scanLabel,
          proofNote: note,
        }),
      });
      setSaved("Collection saved in the portal.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const stop = record?.stop;
  const locked = user.role === "field" && Boolean(record?.visit);

  return (
    <>
      <p className="portal-kicker">Collection done</p>
      <h1>{stop ? stop.clientName : "This stop"}</h1>
      <p className="portal-lede">
        {stop ? [stop.site, stop.city].filter(Boolean).join(", ") || "Site not recorded" : "Loading the stop."}
        {stop?.vehicle ? ` · ${stop.vehicle}` : ""}
      </p>
      {stop?.routeNotes ? <p className="portal-lede">{stop.routeNotes}</p> : null}
      {error ? <p className="portal-error">{error}</p> : null}
      {saved ? <p className="portal-note">{saved}</p> : null}
      {locked ? (
        <section className="portal-card">
          <h2>Saved collection</h2>
          <p className="portal-note">This collection is saved. It cannot be changed.</p>
          <p><strong>Date</strong><br />{record.visit.visitDate}{record.visit.collectedTime ? ` at ${record.visit.collectedTime}` : ""}</p>
          <p><strong>Next person</strong><br />{record.visit.nextPersonName || "—"}</p>
          {record.visit.proofNote ? <p><strong>Note</strong><br />{record.visit.proofNote}</p> : null}
          <Proof visit={record.visit} />
          <p className="portal-note"><Link to="/portal">Back to today</Link></p>
        </section>
      ) : (
      <form className="portal-card portal-form" onSubmit={onSubmit}>
        <h2>Handover</h2>
        <label>Date
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        </label>
        <label>Time
          <input type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
        </label>
        <label>Name of the next person
          <input value={nextPerson} onChange={(event) => setNextPerson(event.target.value)} required />
        </label>
        <SignaturePad ref={staffRef} label="Your signature" />
        <SignaturePad ref={nextRef} label="Next person’s signature, if they sign" />
        <div className="portal-actions">
          <button className="portal-btn line" type="button" onClick={() => cameraRef.current?.click()}>Scan a page</button>
          <button className="portal-btn line" type="button" onClick={() => fileRef.current?.click()}>Choose a file</button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onScan} />
          <input ref={fileRef} type="file" accept="image/*,application/pdf" hidden onChange={onScan} />
        </div>
        {scan ? (
          scan.startsWith("data:application/pdf")
            ? <p className="portal-note">PDF ready to save: {scanLabel}</p>
            : <img className="portal-scan-preview" src={scan} alt="Scanned page" />
        ) : <p className="portal-note">If they hand you a page, scan it with the camera or choose the file. It is saved with this collection.</p>}
        <label>Note
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows="3" />
        </label>
        <button className="portal-btn" type="submit" disabled={busy}>{busy ? "Saving…" : "Save collection"}</button>
        <p className="portal-note"><Link to="/portal">Back to today</Link></p>
      </form>
      )}
    </>
  );
}
