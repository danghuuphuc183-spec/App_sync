"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileUp,
  Lock,
  Mail,
  Megaphone,
  Pin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { VietQRPaymentModal } from "@/components/payment/vietqr-payment-modal";
import { SplitPaymentOrder } from "@/features/payment/payos.types";
import { cn } from "@/lib/utils";
import {
  activeMembers,
  applyCheckIn,
  canManage,
  checkInWithQr,
  classifyContact,
  eventQrToken,
  joinPoolKeo,
  parseInviteCsv,
  postBulletin,
  sendInvites,
  setRole,
  sortedBulletin,
  togglePin,
  toggleRsvp,
  visiblePoolKeos,
  type ClubRole,
} from "@/features/clubs/club-os";
import { ME } from "@/features/clubs/club.data";
import { useClubOs } from "@/features/clubs/use-club-os";
import { PAYMENT_CONFIG, TX_LABEL, formatVnd, quoteFee, type TxKind } from "@/features/clubs/payments";

const TABS = [
  { id: "roster", label: "Thành viên", icon: Users },
  { id: "bulletin", label: "Bảng tin", icon: Megaphone },
  { id: "events", label: "Sự kiện QR", icon: QrCode },
  { id: "pool", label: "Nhóm kín", icon: Lock },
  { id: "invite", label: "Mời", icon: Mail },
  { id: "pay", label: "Thu phí", icon: CreditCard },
] as const;
type TabId = (typeof TABS)[number]["id"];

const ROLE_LABEL: Record<ClubRole, string> = { owner: "Chủ nhiệm", admin: "Quản trị", mentor: "Mentor", member: "Thành viên" };
const SOURCE_LABEL = { manual: "Thủ công", csv: "CSV", domain: "Domain" } as const;
const timeVi = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} · ${d.getDate()}/${d.getMonth() + 1}`;
};

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-3.5", className)}>{children}</div>;
}

export default function ClubOsPage() {
  const { club, ready } = useClubOs();
  const [tab, setTab] = React.useState<TabId>("roster");
  const admin = canManage(club, ME.id);
  const active = activeMembers(club).length;

  return (
    <div className="flex flex-col w-full px-4 pt-4 pb-28 space-y-4">
      <header className="space-y-1">
        <Link href="/cau-lac-bo" className="inline-flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Nhóm
        </Link>
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Quản lý CLB</h1>
        <p className="text-[13px] text-muted-foreground">
          {club.name} · {club.members.length} thành viên · {active} hoạt động 30 ngày
        </p>
      </header>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4" role="tablist" aria-label="Chức năng CLB">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold",
              tab === t.id ? "bg-foreground text-background border-foreground" : "border-border text-foreground hover:bg-muted"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {!ready ? null : tab === "roster" ? (
        <RosterTab admin={admin} />
      ) : tab === "bulletin" ? (
        <BulletinTab admin={admin} />
      ) : tab === "events" ? (
        <EventsTab admin={admin} />
      ) : tab === "pool" ? (
        <PoolTab />
      ) : tab === "invite" ? (
        <InviteTab admin={admin} />
      ) : (
        <PayTab />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function RosterTab({ admin }: { admin: boolean }) {
  const { club, setClub } = useClubOs();
  const since = Date.now() - 30 * 86_400_000;
  return (
    <ul className="space-y-2" aria-label="Danh sách thành viên">
      {club.members.map((m) => {
        const inactive = new Date(m.lastActiveAt).getTime() < since;
        return (
          <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <img src={m.avatar} alt={m.name} className="h-11 w-11 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-foreground truncate">
                {m.name} {m.id === ME.id && <span className="text-muted-foreground font-normal">(bạn)</span>}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {m.checkIns} lần check-in · {inactive ? "Không hoạt động > 30 ngày" : `Hoạt động ${timeVi(m.lastActiveAt)}`}
              </p>
            </div>
            {admin && m.role !== "owner" && m.id !== ME.id ? (
              <select
                aria-label={`Vai trò của ${m.name}`}
                value={m.role}
                onChange={(e) => setClub((c) => setRole(c, ME.id, m.id, e.target.value as ClubRole))}
                className="rounded-lg border border-border bg-background px-2 py-1.5 text-[12.5px] font-semibold text-foreground"
              >
                {(["admin", "mentor", "member"] as const).map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-lg bg-muted px-2 py-1 text-[12px] font-bold text-foreground">{ROLE_LABEL[m.role]}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ---------------------------------------------------------------- */
function BulletinTab({ admin }: { admin: boolean }) {
  const { club, setClub } = useClubOs();
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const name = (id: string) => club.members.find((m) => m.id === id)?.name ?? "Ban chủ nhiệm";
  return (
    <div className="space-y-3">
      {admin && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setClub((c) => postBulletin(c, ME.id, title, body));
            setTitle("");
            setBody("");
          }}
          className="rounded-2xl border border-border bg-card p-3 space-y-2"
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề thông báo" aria-label="Tiêu đề thông báo" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13.5px] font-semibold" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Nội dung" aria-label="Nội dung thông báo" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
          <button disabled={!title.trim()} className="w-full rounded-lg bg-brand text-white py-2.5 text-[13.5px] font-bold disabled:opacity-40">
            Đăng lên bảng tin
          </button>
        </form>
      )}
      {sortedBulletin(club).map((p) => (
        <Card key={p.id} className={p.pinned ? "border-foreground/60" : undefined}>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
                {p.pinned && <Pin className="h-3.5 w-3.5" />}
                {p.title}
              </p>
              <p className="text-[11.5px] text-muted-foreground">
                {name(p.authorId)} · {timeVi(p.createdAt)} · {p.readBy.length}/{club.members.length} đã đọc
              </p>
            </div>
            {admin && (
              <button onClick={() => setClub((c) => togglePin(c, ME.id, p.id))} className="rounded-lg border border-border px-2 py-1 text-[12px] font-bold text-foreground hover:bg-muted">
                {p.pinned ? "Bỏ ghim" : "Ghim"}
              </button>
            )}
          </div>
          {p.body && <p className="mt-2 text-[13px] text-foreground leading-relaxed">{p.body}</p>}
        </Card>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function EventsTab({ admin }: { admin: boolean }) {
  const { club, setClub } = useClubOs();
  const [now, setNow] = React.useState(() => new Date());
  const [msg, setMsg] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(t);
  }, []);
  const secLeft = 60 - (Math.floor(now.getTime() / 1000) % 60);

  return (
    <div className="space-y-3">
      {club.events.map((ev) => {
        const token = eventQrToken(ev, now);
        const going = ev.rsvp.includes(ME.id);
        const checked = ev.checkIns.some((c) => c.memberId === ME.id);
        return (
          <Card key={ev.id} className="space-y-2.5">
            <div>
              <p className="text-[14.5px] font-bold text-foreground">{ev.title}</p>
              <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> {timeVi(ev.startsAt)} · {ev.placeName}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {ev.rsvp.length}/{ev.capacity} đăng ký · {ev.checkIns.length} đã check-in · {ev.membersOnly ? "Chỉ thành viên" : "Mở cho mọi người"}
              </p>
            </div>
            {admin && (
              <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-2.5">
                <QrMatrix seed={token} />
                <div className="text-[12px] text-foreground">
                  <p className="font-bold">Mã QR check-in</p>
                  <p className="text-muted-foreground">Đổi mã sau {secLeft}s — ảnh chụp mã cũ không dùng được.</p>
                  <p className="mt-1 font-mono text-[10.5px] text-muted-foreground break-all">{token}</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setClub((c) => toggleRsvp(c, ev.id, ME.id))}
                className={cn("flex-1 rounded-lg border py-2 text-[13px] font-bold", going ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted")}
              >
                {going ? "Đã đăng ký" : "Đăng ký"}
              </button>
              <button
                disabled={checked}
                onClick={() => {
                  // Demo: mô phỏng quét mã đang hiển thị tại điểm tập
                  const r = checkInWithQr(club, ev.id, ME.id, token, new Date());
                  if (r.ok) setClub((c) => applyCheckIn(c, r.event, ME.id));
                  setMsg((m) => ({ ...m, [ev.id]: r.ok ? "Check-in thành công" : r.reason }));
                }}
                className="flex-1 rounded-lg bg-brand text-white py-2 text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <QrCode className="h-4 w-4" /> {checked ? "Đã check-in" : "Quét QR check-in"}
              </button>
            </div>
            {msg[ev.id] && <p className="text-[12px] font-semibold text-foreground">{msg[ev.id]}</p>}
          </Card>
        );
      })}
    </div>
  );
}

/** Ma trận QR mô phỏng (đổi theo mã) */
function QrMatrix({ seed }: { seed: string }) {
  const cells = React.useMemo(() => {
    let h = 0;
    return Array.from({ length: 121 }, (_, i) => {
      h = (Math.imul(h ^ seed.charCodeAt(i % seed.length), 16777619) + i) >>> 0;
      return (h >> 3) % 2 === 0;
    });
  }, [seed]);
  return (
    <div className="grid shrink-0 rounded-md bg-white p-1.5" style={{ gridTemplateColumns: "repeat(11, 6px)" }} aria-label="Mã QR check-in" role="img">
      {cells.map((on, i) => (
        <span key={i} className={cn("h-[6px] w-[6px]", on ? "bg-black" : "bg-white")} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function PoolTab() {
  const { club, setClub } = useClubOs();
  const keos = visiblePoolKeos(club, ME.id);
  const name = (id: string) => club.members.find((m) => m.id === id)?.name ?? "Thành viên";
  return (
    <div className="space-y-3">
      <p className="flex items-start gap-1.5 text-[12.5px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-foreground" />
        Kèo trong nhóm kín chỉ thành viên CLB nhìn thấy và tham gia. Người ngoài không thấy trên Bảng kèo.
      </p>
      {keos.map((k) => {
        const joined = k.joined.includes(ME.id);
        return (
          <Card key={k.id} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-foreground">{k.title}</p>
              <p className="text-[12px] text-muted-foreground">
                {k.timeVi} · {k.placeName} · {name(k.hostId)} · {k.joined.length}/{k.slots}
              </p>
            </div>
            <button
              disabled={joined || k.joined.length >= k.slots}
              onClick={() => setClub((c) => joinPoolKeo(c, k.id, ME.id))}
              className="shrink-0 rounded-lg bg-brand text-white px-3.5 py-2 text-[13px] font-bold disabled:opacity-50"
            >
              {joined ? "Đã tham gia" : "Tham gia"}
            </button>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- */
function InviteTab({ admin }: { admin: boolean }) {
  const { club, setClub } = useClubOs();
  const [single, setSingle] = React.useState("");
  const [csv, setCsv] = React.useState("");
  const [note, setNote] = React.useState<string | null>(null);
  const parsed = React.useMemo(() => (csv.trim() ? parseInviteCsv(csv) : null), [csv]);
  if (!admin) return <p className="text-[13px] text-muted-foreground">Chỉ ban chủ nhiệm gửi lời mời.</p>;

  const send = (contacts: { contact: string; kind: "email" | "phone" }[], source: "manual" | "csv") => {
    const r = sendInvites(club, contacts, source);
    setClub(() => r.club);
    setNote(`Đã gửi ${r.sent} lời mời${r.skipped ? ` · bỏ qua ${r.skipped} đã mời` : ""}. Họ sẽ vào CLB khi tự bấm Chấp nhận.`);
  };

  return (
    <div className="space-y-3">
      <p className="rounded-xl bg-muted/60 p-3 text-[12.5px] text-foreground">
        Mời bằng email, SĐT, file CSV hay domain đều <b>chỉ gửi lời mời</b>. Không ai bị tự thêm vào CLB — người được mời phải chủ động bấm Chấp nhận.
      </p>
      <Card className="space-y-2">
        <p className="text-[13.5px] font-bold text-foreground">Mời một người</p>
        <div className="flex gap-2">
          <input value={single} onChange={(e) => setSingle(e.target.value)} placeholder="email hoặc SĐT" aria-label="Email hoặc SĐT người được mời" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-[13px]" />
          <button
            disabled={!classifyContact(single)}
            onClick={() => {
              const c = classifyContact(single);
              if (c) send([c], "manual");
              setSingle("");
            }}
            className="rounded-lg bg-brand text-white px-4 text-[13px] font-bold disabled:opacity-40"
          >
            Gửi
          </button>
        </div>
      </Card>
      <Card className="space-y-2">
        <p className="text-[13.5px] font-bold text-foreground flex items-center gap-1.5">
          <FileUp className="h-4 w-4" /> Mời hàng loạt từ CSV
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="Chọn file CSV"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setCsv(await f.text());
          }}
          className="block w-full text-[12.5px] text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:font-bold file:text-foreground"
        />
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={3} placeholder={"Tên,Email\nLan,lan@ftu.edu.vn\nHưng,0903123456"} aria-label="Nội dung CSV" className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[12px]" />
        {parsed && (
          <p className="text-[12px] text-muted-foreground">
            {parsed.contacts.length} liên hệ hợp lệ{parsed.duplicates ? ` · ${parsed.duplicates} trùng` : ""}
            {parsed.invalid.length ? ` · ${parsed.invalid.length} dòng không đọc được` : ""}
          </p>
        )}
        <button disabled={!parsed?.contacts.length} onClick={() => (send(parsed!.contacts, "csv"), setCsv(""))} className="w-full rounded-lg bg-brand text-white py-2.5 text-[13.5px] font-bold disabled:opacity-40">
          Gửi {parsed?.contacts.length ?? 0} lời mời
        </button>
      </Card>
      <Card className="text-[12.5px] text-foreground">
        <p className="font-bold">Mời theo domain email</p>
        <p className="text-muted-foreground">
          Người có email <b>@{club.inviteDomains.join(", @")}</b> đã xác thực sẽ nhận lời mời trong mục Nhóm — không tự gia nhập.
        </p>
      </Card>
      {note && <p className="text-[12.5px] font-semibold text-foreground">{note}</p>}
      <div>
        <p className="mb-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Lời mời đã gửi</p>
        <ul className="space-y-1.5">
          {club.invitations.slice(0, 8).map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-[12.5px]">
              <span className="truncate text-foreground">{i.contact}</span>
              <span className="shrink-0 text-muted-foreground">
                {SOURCE_LABEL[i.source]} · {i.status === "sent" ? "Chờ chấp nhận" : i.status === "accepted" ? "Đã chấp nhận" : "Từ chối"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
function PayTab() {
  const [kind, setKind] = React.useState<TxKind>("club_membership");
  const [amount, setAmount] = React.useState(150_000);
  const [paymentOrder, setPaymentOrder] = React.useState<SplitPaymentOrder | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = React.useState(false);
  const q = quoteFee(kind, amount);

  const handleCreatePayment = async () => {
    if (amount <= 0) return;
    setIsCreatingPayment(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: kind === "coaching_booking" ? "coaching_starter" : "club_membership",
          title: `${TX_LABEL[kind]} · CLB Running FTU2`,
          amount,
          buyerName: "Thành viên CLB (Tester)",
          partnerKey: "club_running_ftu2",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPaymentOrder(data.data);
      }
    } catch (err) {
      console.error("Lỗi tạo đơn thanh toán:", err);
    } finally {
      setIsCreatingPayment(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl bg-primary/10 border border-primary/20 p-3">
        <div>
          <p className="text-xs font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Cổng payOS VietQR Split Payment
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Tiền chuyển thẳng tài khoản CLB (ACB), tự động trích phí về Vietcombank 09090909.
          </p>
        </div>
        <Link
          href="/thanh-toan/demo"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 shrink-0 ml-2"
        >
          Trang Demo <ArrowLeft className="h-3 w-3 rotate-180" />
        </Link>
      </div>

      <p className="rounded-xl bg-muted/60 p-3 text-[12.5px] text-foreground">
        Thu qua <b>{PAYMENT_CONFIG.partnerNameVi}</b> ({PAYMENT_CONFIG.methods.join(", ")}). SYNESIS không giữ tiền. Phí hiển thị từng dòng trước khi thanh toán; quỹ phạt không bị thu phí nền tảng.
      </p>
      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(TX_LABEL) as TxKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              aria-pressed={kind === k}
              className={cn("rounded-lg border px-2.5 py-2 text-[12.5px] font-bold text-left", kind === k ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:bg-muted")}
            >
              {TX_LABEL[k]}
              <span className="block text-[11px] font-normal opacity-70">{PAYMENT_CONFIG.platformPercent[k] ? `Phí nền tảng ${PAYMENT_CONFIG.platformPercent[k]}%` : "Không phí nền tảng"}</span>
            </button>
          ))}
        </div>
        <label className="block">
          <span className="text-[12px] text-muted-foreground">Số tiền</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={10_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Số tiền"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-[16px] font-bold"
          />
        </label>
        <dl className="space-y-1.5 text-[13px]" aria-label="Chi tiết phí">
          {q.lines.map((l, i) => (
            <div key={l.label} className={cn("flex justify-between", i === q.lines.length - 1 && "border-t border-border pt-1.5 font-bold")}>
              <dt className="text-foreground">{l.label}</dt>
              <dd className="text-foreground tabular-nums">{formatVnd(l.vnd)}</dd>
            </div>
          ))}
        </dl>
        {!q.eligible && (
          <p className="flex items-center gap-1.5 text-[12px] text-foreground">
            <CheckCircle2 className="h-4 w-4" /> Giao dịch này không thu phí nền tảng.
          </p>
        )}

        <button
          type="button"
          disabled={isCreatingPayment || amount <= 0}
          onClick={handleCreatePayment}
          className="w-full mt-3 rounded-xl bg-primary py-2.5 font-bold text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 text-xs transition-colors shadow-sm disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" />
          {isCreatingPayment ? "Đang tạo mã VietQR..." : "Tạo Mã VietQR Thanh Toán (payOS Split Payment)"}
        </button>
      </Card>

      {paymentOrder && (
        <VietQRPaymentModal
          order={paymentOrder}
          onClose={() => setPaymentOrder(null)}
        />
      )}
    </div>
  );
}
