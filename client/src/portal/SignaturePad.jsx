import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const SignaturePad = forwardRef(function SignaturePad({ label, onChange }, ref) {
  const canvasRef = useRef(null);
  const strokes = useRef([]);
  const active = useRef(null);

  function paint() {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const nextWidth = Math.max(1, Math.round(width * ratio));
    const nextHeight = Math.max(1, Math.round(height * ratio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#101a30";
    ctx.fillStyle = "#101a30";
    for (const stroke of strokes.current) {
      if (!stroke.length) continue;
      if (stroke.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke[0].x * width, stroke[0].y * height, 1.3, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(stroke[0].x * width, stroke[0].y * height);
      for (const place of stroke.slice(1)) ctx.lineTo(place.x * width, place.y * height);
      ctx.stroke();
    }
    return strokes.current.some((stroke) => stroke.length) ? canvas.toDataURL("image/png") : "";
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    paint();
    const observer = new ResizeObserver(() => paint());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function placeOf(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }

  function publish() {
    const image = paint();
    if (onChange) onChange(image);
  }

  function start(event) {
    event.preventDefault();
    const canvas = canvasRef.current;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      // The stroke is still kept if the browser refuses capture.
    }
    active.current = [placeOf(event)];
    strokes.current.push(active.current);
    paint();
  }

  function move(event) {
    if (!active.current) return;
    event.preventDefault();
    active.current.push(placeOf(event));
    paint();
  }

  function finish() {
    if (!active.current) return;
    active.current = null;
    publish();
  }

  function clear() {
    strokes.current = [];
    active.current = null;
    publish();
  }

  function toDataUrl() {
    paint();
    const canvas = canvasRef.current;
    if (!canvas || !strokes.current.some((stroke) => stroke.length)) return "";
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let found = false;
    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        if (pixels[(y * canvas.width + x) * 4 + 3] < 20) continue;
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
    if (!found) return "";
    const pad = 18;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(canvas.width - 1, maxX + pad);
    maxY = Math.min(canvas.height - 1, maxY + pad);
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const outW = 900;
    const outH = 320;
    const scale = Math.min((outW - 48) / cropW, (outH - 48) / cropH);
    const drawW = cropW * scale;
    const drawH = cropH * scale;
    const out = document.createElement("canvas");
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(canvas, minX, minY, cropW, cropH, (outW - drawW) / 2, (outH - drawH) / 2, drawW, drawH);
    return out.toDataURL("image/png");
  }

  useImperativeHandle(ref, () => ({ toDataUrl }));

  return (
    <div className="portal-sign-field">
      <span>{label}</span>
      <canvas
        ref={canvasRef}
        className="portal-sign"
        aria-label={label}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
      />
      <button className="portal-btn line" type="button" onClick={clear}>Clear signature</button>
    </div>
  );
});

export default SignaturePad;
