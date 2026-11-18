import { useEffect, useState } from "react";
import { portalBlob } from "./api.js";

function ProofFile({ visitId, kind, label }) {
  const [file, setFile] = useState(null);

  useEffect(() => {
    let active = true;
    let url = "";
    portalBlob(`/api/portal/visits/${visitId}/file/${kind}`)
      .then((result) => {
        url = result.url;
        if (active) setFile(result);
      })
      .catch(() => {
        if (active) setFile(null);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [visitId, kind]);

  if (!file) return null;
  if (file.type.includes("pdf")) {
    return <a className="portal-proof-link" href={file.url} target="_blank" rel="noreferrer">{label}</a>;
  }
  return (
    <a href={file.url} target="_blank" rel="noreferrer">
      <img className="portal-proof" src={file.url} alt={label} />
      <span>{label}</span>
    </a>
  );
}

export default function Proof({ visit }) {
  if (!visit?.proof) return null;
  const items = [
    visit.proof.staff ? ["staff", "Collector signature"] : null,
    visit.proof.next ? ["next", "Next person"] : null,
    visit.proof.scan ? ["scan", visit.proof.scanLabel || "Scanned page"] : null,
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="portal-proofs">
      {items.map(([kind, label]) => (
        <ProofFile key={kind} visitId={visit._id} kind={kind} label={label} />
      ))}
    </div>
  );
}
