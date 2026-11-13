import type { Club, Invitation } from "./club-os";

const av = (id: string) => `https://images.unsplash.com/${id}?w=150&auto=format&fit=crop&q=80`;
const at = (dayOffset: number, h: number, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const ME = { id: "me", name: "Minh Thư", avatar: av("photo-1534528741775-53994a69daeb") };

/** CLB bạn đang làm Admin (FTU2 Run Club) */
export const seedClub = (): Club => ({
  id: "club-1",
  name: "FTU2 Run Club",
  sportVi: "Chạy bộ",
  areaVi: "Bình Thạnh & Q.1",
  inviteDomains: ["ftu.edu.vn"],
  members: [
    { id: "u-owner", name: "Quốc Hưng", avatar: av("photo-1507003211169-0a1dd7228f2d"), role: "owner", joinedAt: at(-400, 6), checkIns: 86, lastActiveAt: at(-1, 6) },
    { id: "me", name: ME.name, avatar: ME.avatar, role: "admin", joinedAt: at(-200, 6), checkIns: 41, lastActiveAt: at(0, 6) },
    { id: "u-ma", name: "Minh Anh", avatar: av("photo-1544005313-94ddf0286df2"), role: "mentor", joinedAt: at(-160, 6), checkIns: 52, lastActiveAt: at(-2, 6) },
    { id: "u-td", name: "Thuỳ Dung", avatar: av("photo-1438761681033-6461ffad8d80"), role: "member", joinedAt: at(-90, 6), checkIns: 17, lastActiveAt: at(-5, 18) },
    { id: "u-dt", name: "Đức Trọng", avatar: av("photo-1500648767791-00dcc994a43e"), role: "member", joinedAt: at(-60, 6), checkIns: 9, lastActiveAt: at(-12, 18) },
    { id: "u-yn", name: "Yến Nhi", avatar: av("photo-1517841905240-472988babdf9"), role: "member", joinedAt: at(-30, 6), checkIns: 4, lastActiveAt: at(-41, 18) },
  ],
  invitations: [
    { id: "inv-seed-1", clubId: "club-1", clubName: "FTU2 Run Club", contact: "lan.nguyen@ftu.edu.vn", kind: "email", source: "csv", status: "sent", sentAt: at(-1, 9) },
    { id: "inv-seed-2", clubId: "club-1", clubName: "FTU2 Run Club", contact: "0903123456", kind: "phone", source: "manual", status: "accepted", sentAt: at(-6, 9) },
  ],
  bulletin: [
    {
      id: "post-1",
      authorId: "u-owner",
      title: "Lịch long run Chủ Nhật",
      body: "Tập trung 05:15 cổng Landmark 81, chạy 14 km pace 6:30. Mang nước và áo phản quang.",
      pinned: true,
      createdAt: at(-1, 20),
      readBy: ["u-owner", "u-ma"],
    },
    {
      id: "post-2",
      authorId: "me",
      title: "Đóng phí thành viên quý IV",
      body: "Phí 150.000đ/quý thanh toán qua cổng đối tác trong tab Thu phí. Phí hiển thị rõ trước khi trả.",
      pinned: false,
      createdAt: at(-3, 10),
      readBy: ["me"],
    },
  ],
  events: [
    {
      id: "ev-1",
      title: "Interval 8×400m bờ kè Thanh Đa",
      placeName: "Cổng bến du thuyền Landmark 81",
      startsAt: at(0, 5, 30),
      endsAt: at(0, 23, 0),
      capacity: 30,
      rsvp: ["me", "u-ma", "u-td"],
      checkIns: [{ memberId: "u-ma", at: at(0, 5, 25) }],
      qrSecret: "ftu2-ev1-secret",
      membersOnly: true,
    },
    {
      id: "ev-2",
      title: "Long run 14 km Chủ Nhật",
      placeName: "Công viên Vinhomes Central Park",
      startsAt: at(3, 5, 15),
      endsAt: at(3, 8, 0),
      capacity: 40,
      rsvp: ["u-owner"],
      checkIns: [],
      qrSecret: "ftu2-ev2-secret",
      membersOnly: false,
    },
  ],
  privatePool: {
    enabled: true,
    keos: [
      { id: "pk-1", title: "Easy 6 km sau giờ học", hostId: "u-td", timeVi: "18:00 Thứ Năm", placeName: "Sân trường FTU2", slots: 4, joined: ["u-td"] },
      { id: "pk-2", title: "Tempo 5 km chuẩn bị giải", hostId: "u-ma", timeVi: "05:30 Thứ Bảy", placeName: "Bờ kè Thanh Đa", slots: 6, joined: ["u-ma", "u-dt"] },
    ],
  },
});

/** Lời mời gửi tới bạn từ CLB khác — bạn phải tự Chấp nhận */
export const seedMyInvitations = (): Invitation[] => [
  {
    id: "inv-me-1",
    clubId: "club-2",
    clubName: "Saigon Pickleball Riverside",
    contact: "minhthu@ftu.edu.vn",
    kind: "email",
    source: "domain",
    status: "sent",
    sentAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
    userId: "me",
    note: "CLB mời sinh viên có email @ftu.edu.vn đã xác thực",
  },
];
