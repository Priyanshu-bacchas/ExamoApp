// Payment slip: colourful sticky notes wali PNG image (browser me hi banti hai)

const W = 1000;
const H = 1340;
const SCALE = 2; // retina jaisi saaf image

const HAND =
  '"Segoe Print","Bradley Hand","Chalkboard SE","Marker Felt","Comic Sans MS",cursive';
const SANS =
  '"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const MONO = 'Consolas,"Courier New",monospace';

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// 28 Oct 2026
export function formatSlipDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "-";

  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// Start aur end date ke beech kitne din
export function daysBetween(start, end) {
  if (!start || !end) return 0;

  const a = new Date(start).getTime();
  const b = new Date(end).getTime();

  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;

  return Math.round((b - a) / (24 * 60 * 60 * 1000));
}

// Text ko width me fit karo (zarurat ho to font chhota)
function fitText(ctx, text, fontFor, maxWidth, size, minSize = 14) {
  let s = size;

  ctx.font = fontFor(s);

  while (ctx.measureText(text).width > maxWidth && s > minSize) {
    s -= 1;
    ctx.font = fontFor(s);
  }

  return s;
}

function drawText(ctx, text, x, y, options = {}) {
  const {
    fontFor = (s) => `${s}px ${SANS}`,
    size = 24,
    color = "#1f2937",
    align = "left",
    maxWidth = 0,
    minSize = 14,
  } = options;

  if (maxWidth > 0) {
    fitText(ctx, text, fontFor, maxWidth, size, minSize);
  } else {
    ctx.font = fontFor(size);
  }

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
}

// Ek sticky note: kagaz, kona mudaa hua, tape aur halka tilt
function drawNote(ctx, spec, content) {
  const { x, y, w, h, rotate, color, flap, tape } = spec;
  const fold = 46;

  ctx.save();

  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  // Kagaz + parchhai
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 12;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h - fold);
  ctx.lineTo(w - fold, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Upar halki chamak
  const shine = ctx.createLinearGradient(0, 0, 0, h);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.45)");
  shine.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  shine.addColorStop(1, "rgba(0, 0, 0, 0.05)");

  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h - fold);
  ctx.lineTo(w - fold, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Mudaa hua kona
  ctx.fillStyle = flap;
  ctx.beginPath();
  ctx.moveTo(w, h - fold);
  ctx.lineTo(w - fold, h);
  ctx.lineTo(w - fold, h - fold);
  ctx.closePath();
  ctx.fill();

  // Tape
  if (tape) {
    ctx.save();
    ctx.translate(w / 2, 4);
    ctx.rotate((-2.5 * Math.PI) / 180);
    ctx.fillStyle = tape;
    ctx.fillRect(-62, -18, 124, 36);
    ctx.restore();
  }

  content(ctx, w, h);

  ctx.restore();
}

// Chhota note: label + badi value + niche chhota text
function smallNote(ctx, label, value, sub, valueSize = 44) {
  return (c, w) => {
    drawText(c, label, 30, 56, {
      fontFor: (s) => `600 ${s}px ${HAND}`,
      size: 27,
      color: "rgba(0, 0, 0, 0.55)",
    });

    drawText(c, value, 30, 136, {
      fontFor: (s) => `700 ${s}px ${HAND}`,
      size: valueSize,
      color: "#1f2937",
      maxWidth: w - 60,
      minSize: 22,
    });

    if (sub) {
      drawText(c, sub, 30, 186, {
        fontFor: (s) => `${s}px ${SANS}`,
        size: 22,
        color: "rgba(0, 0, 0, 0.6)",
        maxWidth: w - 60,
        minSize: 14,
      });
    }
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/*
  data = {
    receiptNo, amountText, currency, paidOn,
    planName, studentName,
    startsOn, endsOn, validityText,
    paymentId, txnId
  }
  Return: PNG Blob
*/
export function createPaymentSlip(data) {
  const canvas = document.createElement("canvas");

  canvas.width = W * SCALE;
  canvas.height = H * SCALE;

  const ctx = canvas.getContext("2d");

  ctx.scale(SCALE, SCALE);

  // Background (halka cream + dots)
  ctx.fillStyle = "#f5efe3";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(120, 100, 70, 0.10)";

  for (let gx = 20; gx < W; gx += 30) {
    for (let gy = 20; gy < H; gy += 30) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const symbol = data.currency === "INR" || !data.currency
    ? "₹"
    : `${data.currency} `;

  // 1) Peela bada note: receipt + amount + PAID
  drawNote(
    ctx,
    {
      x: 70, y: 80, w: 860, h: 390, rotate: -1.2,
      color: "#fff176", flap: "#e6d24f", tape: "rgba(244, 114, 182, 0.65)",
    },
    (c, w, h) => {
      // Brand
      c.fillStyle = "#2563eb";
      roundRect(c, 34, 44, 50, 50, 12);
      c.fill();

      drawText(c, "E", 59, 81, {
        fontFor: (s) => `800 ${s}px ${SANS}`,
        size: 32,
        color: "#ffffff",
        align: "center",
      });

      drawText(c, "Examo", 98, 78, {
        fontFor: (s) => `800 ${s}px ${SANS}`,
        size: 34,
        color: "#1e3a8a",
      });

      drawText(c, "Payment Receipt", 34, 160, {
        fontFor: (s) => `700 ${s}px ${HAND}`,
        size: 54,
        color: "#1f2937",
        maxWidth: w - 68,
      });

      drawText(c, `${symbol}${data.amountText}`, 34, 288, {
        fontFor: (s) => `800 ${s}px ${SANS}`,
        size: 112,
        color: "#111827",
        maxWidth: 520,
        minSize: 48,
      });

      drawText(c, "Paid via PayU", 36, 316, {
        fontFor: (s) => `${s}px ${SANS}`,
        size: 24,
        color: "rgba(0, 0, 0, 0.6)",
      });

      // PAID stamp
      c.save();
      c.translate(w - 215, 250);
      c.rotate((-9 * Math.PI) / 180);
      c.strokeStyle = "#16a34a";
      c.lineWidth = 7;
      roundRect(c, -105, -48, 210, 96, 16);
      c.stroke();

      drawText(c, "PAID", 0, 22, {
        fontFor: (s) => `800 ${s}px ${SANS}`,
        size: 62,
        color: "#16a34a",
        align: "center",
      });
      c.restore();

      drawText(
        c,
        `Receipt No: ${data.receiptNo}     Paid on: ${data.paidOn}`,
        34,
        h - 24,
        {
          fontFor: (s) => `${s}px ${SANS}`,
          size: 24,
          color: "rgba(0, 0, 0, 0.7)",
          maxWidth: w - 120,
          minSize: 14,
        }
      );
    }
  );

  // 2) Pink: plan
  drawNote(
    ctx,
    {
      x: 70, y: 530, w: 410, h: 230, rotate: 1.6,
      color: "#ffb3d1", flap: "#e68fb2", tape: "rgba(250, 204, 21, 0.7)",
    },
    smallNote(ctx, "Plan", data.planName, "Examo subscription")
  );

  // 3) Neela: student
  drawNote(
    ctx,
    {
      x: 520, y: 540, w: 410, h: 220, rotate: -1.8,
      color: "#9ad7ff", flap: "#74b9e6", tape: "rgba(52, 211, 153, 0.7)",
    },
    smallNote(ctx, "Paid by", data.studentName, "Student", 40)
  );

  // 4) Hara: plan start
  drawNote(
    ctx,
    {
      x: 70, y: 815, w: 410, h: 230, rotate: -1.3,
      color: "#a5f3a0", flap: "#7dd678", tape: "rgba(96, 165, 250, 0.7)",
    },
    smallNote(ctx, "Plan starts", data.startsOn, "Your plan begins on this date", 42)
  );

  // 5) Narangi: plan end
  drawNote(
    ctx,
    {
      x: 520, y: 825, w: 410, h: 230, rotate: 1.7,
      color: "#ffc58a", flap: "#e8a566", tape: "rgba(244, 114, 182, 0.65)",
    },
    smallNote(
      ctx,
      "Plan ends",
      data.endsOn,
      data.validityText ? `Valid for ${data.validityText}` : "Valid till this date",
      42
    )
  );

  // 6) Baingani: payment details
  drawNote(
    ctx,
    {
      x: 70, y: 1105, w: 860, h: 190, rotate: 0.7,
      color: "#d9c2ff", flap: "#b99ae6", tape: "rgba(250, 204, 21, 0.7)",
    },
    (c, w) => {
      drawText(c, "Payment details", 32, 52, {
        fontFor: (s) => `600 ${s}px ${HAND}`,
        size: 27,
        color: "rgba(0, 0, 0, 0.55)",
      });

      drawText(c, `Payment ID : ${data.paymentId}`, 32, 94, {
        fontFor: (s) => `${s}px ${MONO}`,
        size: 25,
        color: "#1f2937",
        maxWidth: w - 64,
      });

      drawText(c, `Txn ID     : ${data.txnId}`, 32, 130, {
        fontFor: (s) => `${s}px ${MONO}`,
        size: 25,
        color: "#1f2937",
        maxWidth: w - 64,
      });

      drawText(c, "Thank you for choosing Examo! Keep this slip for your records.", 32, 168, {
        fontFor: (s) => `600 ${s}px ${HAND}`,
        size: 23,
        color: "rgba(0, 0, 0, 0.65)",
        maxWidth: w - 64,
      });
    }
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the image."));
    }, "image/png");
  });
}
