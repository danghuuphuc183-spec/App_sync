import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CancelKeoSheet, type CancelableKeo } from "./cancel-keo-sheet";

const inMin = (m: number) => new Date(Date.now() + m * 60_000).toISOString();
const base: CancelableKeo = {
  id: "k1",
  title: "Chạy 10 km",
  startsAt: inMin(20),
  lockedAt: inMin(-600),
  acceptedBy: ["me"],
  kind: "personal",
  role: "member",
  hostId: "h",
  members: [{ id: "h", name: "Minh Quân", ut: 9 }, { id: "me", name: "Bạn", ut: 8 }],
};

describe("CancelKeoSheet", () => {
  it("kèo đã chốt còn 20 phút: hiện −0,5 UT; thẻ ân hạn đưa về 0", () => {
    const onDone = vi.fn();
    render(<CancelKeoSheet keo={base} open onClose={() => {}} onDone={onDone} />);
    expect(screen.getByRole("status")).toHaveTextContent("Huỷ bây giờ: −0,5 UT. Không đến: −1 UT");
    fireEvent.click(screen.getByLabelText("Dùng thẻ ân hạn"));
    fireEvent.click(screen.getByRole("button", { name: /Huỷ một phía · 0 UT/ }));
    expect(onDone).toHaveBeenCalledWith({ type: "cancelled", delta: 0, usedGrace: true, newHostName: undefined });
  });

  it("host rút khỏi kèo nhóm: kèo giữ nguyên, quyền host chuyển cho người UT cao nhất", () => {
    render(
      <CancelKeoSheet
        keo={{
          ...base,
          kind: "group",
          role: "host",
          hostId: "me",
          startsAt: inMin(24 * 60),
          members: [{ id: "me", name: "Bạn", ut: 8 }, { id: "a", name: "Minh Anh", ut: 9.5 }, { id: "b", name: "Đức Trọng", ut: 7 }],
        }}
        open
        onClose={() => {}}
        onDone={() => {}}
      />
    );
    expect(screen.getByText("Minh Anh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rút khỏi kèo · −0,25 UT/ })).toBeInTheDocument();
  });

  it("chưa chốt: rút không bị trừ điểm", () => {
    const onDone = vi.fn();
    render(<CancelKeoSheet keo={{ ...base, lockedAt: undefined }} open onClose={() => {}} onDone={onDone} />);
    fireEvent.click(screen.getByRole("button", { name: /không bị trừ điểm/ }));
    expect(onDone).toHaveBeenCalledWith({ type: "withdraw_free" });
  });
});
