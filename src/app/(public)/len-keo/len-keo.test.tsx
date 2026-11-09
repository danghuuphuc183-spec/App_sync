import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { GroupFlow, PersonalFlow } from "@/components/keo/keo-flows";
import { BrowseKeos } from "@/components/keo/browse-keos";

const done = (name: RegExp) => screen.getByRole("button", { name });

describe("Lên kèo cá nhân", () => {
  beforeEach(() => window.localStorage.clear());

  it("nút Done bị khoá tới khi chọn địa điểm, sau đó gợi ý tối đa 3 người và cho Chấp nhận", () => {
    render(<PersonalFlow />);
    expect(done(/Done · Tìm bạn tập/)).toBeDisabled();
    expect(screen.getByText(/Còn thiếu: địa điểm/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Landmark 81/ })[0]!);
    expect(done(/Done · Tìm bạn tập/)).toBeEnabled();
    fireEvent.click(done(/Done · Tìm bạn tập/));

    const accepts = screen.getAllByRole("button", { name: /Chấp nhận/ });
    expect(accepts.length).toBeGreaterThan(0);
    expect(accepts.length).toBeLessThanOrEqual(3);
    expect(screen.getAllByText("tương thích").length).toBe(accepts.length);

    fireEvent.click(accepts[0]!);
    expect(screen.getByText(/Đã ghép kèo với/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Xem kèo của tôi" })).toHaveAttribute("href", "/ho-so?tab=bounties");
  });

  it("đặt làm mặc định → lần sau form tự điền lại", () => {
    const { unmount } = render(<PersonalFlow />);
    fireEvent.click(screen.getAllByRole("button", { name: /Landmark 81/ })[0]!);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(done(/Done · Tìm bạn tập/));
    unmount();

    render(<PersonalFlow />);
    expect(screen.getByText("Đang dùng cài đặt mặc định của bạn")).toBeInTheDocument();
    expect(done(/Done · Tìm bạn tập/)).toBeEnabled();
  });
});

describe("Chọn giờ bằng biểu đồ hoạt động", () => {
  beforeEach(() => window.localStorage.clear());

  it("có biểu đồ giờ đông nhất và thanh trượt không cho giờ kết thúc <= giờ bắt đầu", () => {
    render(<PersonalFlow />);
    expect(screen.getByRole("img", { name: /Mức hoạt động theo giờ, đông nhất lúc/ })).toBeInTheDocument();
    const start = screen.getByLabelText("Giờ bắt đầu");
    const end = screen.getByLabelText("Giờ kết thúc");
    fireEvent.change(end, { target: { value: "8" } }); // 08:00
    fireEvent.change(start, { target: { value: "20" } }); // cố kéo quá giờ kết thúc
    expect(screen.getByText("07:30 – 08:00")).toBeInTheDocument();
  });
});

describe("Lên kèo nhóm", () => {
  beforeEach(() => window.localStorage.clear());

  it("Done → danh sách nhóm đang thiếu người → bỏ qua để tự lập nhóm", () => {
    render(<GroupFlow />);
    expect(screen.getByText("Hiện diện")).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole("button", { name: /Pickleball Saigon Riverside/ })[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Hôm nay" }));
    // Thanh trượt 2 đầu trên biểu đồ hoạt động: 17:00 → 19:00
    fireEvent.change(screen.getByLabelText("Giờ kết thúc"), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText("Giờ bắt đầu"), { target: { value: "26" } });
    expect(screen.getByText("17:00 – 19:00")).toBeInTheDocument();
    fireEvent.click(done(/Done · Tìm nhóm/));

    expect(screen.getByText("Nhóm đang thiếu người")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Bỏ qua · Tự lập nhóm/ }));
    expect(screen.getByText("Nhóm của bạn đã được đăng")).toBeInTheDocument();
  });
});

describe("Xem kèo", () => {
  beforeEach(() => window.localStorage.clear());

  it("hiện kèo có ảnh, lý do gợi ý và cho tham gia", () => {
    render(<BrowseKeos />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThan(3);
    expect(within(cards[0]!).getByRole("img", { name: /tại/ })).toBeInTheDocument();

    const joinBtn = within(cards[0]!).getByRole("button", { name: /cọc/ });
    fireEvent.click(joinBtn);
    fireEvent.click(screen.getAllByRole("button", { name: /cọc/ }).at(-1)!);
    expect(screen.getByText("Đã tham gia kèo")).toBeInTheDocument();
  });
});

describe("Buổi tập đề xuất trong gợi ý", () => {
  beforeEach(() => window.localStorage.clear());

  it("chạy bộ: có bản đồ cung đường, giờ, địa điểm, pace chung và cường độ", () => {
    render(<PersonalFlow />);
    fireEvent.click(screen.getAllByRole("button", { name: /Landmark 81/ })[0]!);
    fireEvent.click(done(/Done · Tìm bạn tập/));

    expect(screen.getAllByRole("img", { name: /Bản đồ quãng đường/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pace chung/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cường độ (nhẹ|vừa|cao)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ngày mai · \d{2}:\d{2} – \d{2}:\d{2}/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem chi tiết cung đường/ })[0]!);
    expect(screen.getByRole("dialog", { name: "Chi tiết cung đường" })).toBeInTheDocument();
  });

  it("gym: có tên phòng tập, ngày tập nhóm cơ, bài tập, giờ và trang đánh giá cho người mới", () => {
    render(<PersonalFlow />);
    fireEvent.click(screen.getByRole("button", { name: /Gym/ }));
    fireEvent.click(screen.getAllByRole("button", { name: /The New Gym - Điện Biên Phủ/ })[0]!);
    fireEvent.change(screen.getByLabelText("Giờ kết thúc"), { target: { value: "32" } }); // 20:00
    fireEvent.change(screen.getByLabelText("Giờ bắt đầu"), { target: { value: "28" } }); // 18:00
    fireEvent.click(done(/Done · Tìm bạn tập/));

    expect(screen.getAllByText(/^Ngày (Chân|Ngực|Lưng|Toàn thân|Boxing|Kéo)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nhóm cơ:/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/hiệp/).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole("button", { name: /Xem chi tiết & đánh giá phòng tập/ })[0]!);
    const sheet = screen.getByRole("dialog", { name: "Chi tiết phòng tập" });
    expect(within(sheet).getByText(/Chưa đăng ký phòng tập này/)).toBeInTheDocument();
    expect(within(sheet).getByText(/đánh giá$/)).toBeInTheDocument();
    expect(within(sheet).getByRole("link", { name: /Chỉ đường/ })).toBeInTheDocument();
  });
});
