import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Ảnh xem trước khi chia sẻ link (LinkedIn, Facebook, Zalo…). Next.js tự gắn thẻ og:image.
 * LinkedIn yêu cầu tối thiểu 1200×627, tỉ lệ ~1.91:1 → dùng 1200×630.
 * Chữ trên ảnh viết tiếng Anh (chỉ ký tự Latin) vì font mặc định của trình dựng ảnh
 * không bảo đảm đủ dấu tiếng Việt.
 */
export const alt = "Synesis — find your training partner in Ho Chi Minh City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#070B1A";
const MIST = "#CBE9FD";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-icon-584.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: INK,
          backgroundImage:
            "radial-gradient(900px 520px at 100% 0%, rgba(25,81,252,0.55), rgba(25,81,252,0) 60%), radial-gradient(700px 420px at 0% 100%, rgba(11,44,177,0.6), rgba(11,44,177,0) 60%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Vạch làn chạy mờ — motif của hệ thiết kế "bảng tỉ số" */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -200,
              left: 640 + i * 92,
              width: 2,
              height: 1100,
              backgroundColor: "rgba(255,255,255,0.06)",
              transform: "rotate(25deg)",
            }}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={logoSrc} width={84} height={84} style={{ borderRadius: 20 }} alt="" />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, letterSpacing: 8 }}>SYNESIS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 82, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2 }}>
            Find your training partner.
          </div>
          <div style={{ display: "flex", fontSize: 32, color: MIST, opacity: 0.9 }}>
            Match by time, place and pace. Show up, keep the streak.
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
            {["Running", "Gym", "Cycling"].map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  padding: "10px 24px",
                  borderRadius: 999,
                  fontSize: 26,
                  fontWeight: 700,
                  backgroundImage: "linear-gradient(118deg, #0b2cb1 0%, #1951fc 52%, #2e6bfa 100%)",
                  boxShadow: "0 10px 30px rgba(25,81,252,0.45)",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: MIST, opacity: 0.75 }}>
          <div style={{ display: "flex" }}>Ho Chi Minh City</div>
          <div style={{ display: "flex" }}>Early-stage web app</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
