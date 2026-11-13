import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { GroupFlow, PersonalFlow, SoloFlow } from "@/components/keo/keo-flows";
import { BrowseKeos } from "@/components/keo/browse-keos";
import { MyKeosSection } from "@/components/keo/my-keos";

const done = (name: RegExp) => screen.getByRole("button", { name });

describe("Lên kèo 1:1", () => {
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
    fireEvent.click(screen.getByRole("button", { name: /\(Hôm nay\)/ }));
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

  it("Nhận kèo → bảng chấp nhận có tin xác nhận; chấp nhận xong mới vào chat với host, nút đổi thành Mở chat kèo", () => {
    render(<BrowseKeos />);
    const cards = screen.getAllByRole("article");
    expect(cards.length).toBeGreaterThan(3);
    expect(within(cards[0]!).getByRole("img", { name: /tại/ })).toBeInTheDocument();
    // chưa chấp nhận: không có nút mở chat
    expect(screen.queryByRole("button", { name: "Mở chat kèo" })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Nhận kèo" })[0]!);
    const sheet = screen.getByRole("dialog", { name: "Nhận kèo" });
    expect(screen.queryByRole("dialog", { name: "Chat kèo" })).not.toBeInTheDocument();
    const input = within(sheet).getByLabelText("Tin nhắn xác nhận") as HTMLTextAreaElement;
    expect(input.value).toMatch(/^Chào .+! Mình nhận kèo/);
    const acceptBtn = within(sheet).getByRole("button", { name: /Chấp nhận kèo/ });

    fireEvent.change(input, { target: { value: "ok" } });
    expect(acceptBtn).toBeDisabled();
    fireEvent.change(input, { target: { value: "Mình nhận kèo nhé, hẹn bạn!" } });
    fireEvent.click(acceptBtn);

    const chat = screen.getByRole("dialog", { name: "Chat kèo" });
    expect(within(chat).getByText("Mình nhận kèo nhé, hẹn bạn!")).toBeInTheDocument();
    expect(within(chat).getByText(/đã nhận kèo\.$/)).toBeInTheDocument();
    expect(within(chat).getByText(/^Đã gửi thông báo cho /)).toBeInTheDocument();
    expect(within(chat).getByTestId("reminders")).toBeInTheDocument();

    fireEvent.click(within(chat).getByRole("button", { name: "Đóng chat" }));
  });

  it("nhận kèo 1:1 xong → kèo ẩn ngay khỏi Kèo đang mở, chuyển sang Kèo của bạn", () => {
    render(
      <>
        <MyKeosSection />
        <BrowseKeos />
      </>
    );
    const card = screen.getAllByRole("article").find((c) => within(c).queryByRole("button", { name: "Nhận kèo" }))!;
    const title = within(card).getByRole("heading").textContent!;
    fireEvent.click(within(card).getByRole("button", { name: "Nhận kèo" }));
    fireEvent.click(screen.getByRole("button", { name: /Chấp nhận kèo/ }));
    fireEvent.click(screen.getByRole("button", { name: "Đóng chat" }));

    expect(screen.queryByRole("article", { name: title })).not.toBeInTheDocument();
    const mine = screen.getByRole("region", { name: "Kèo của bạn" });
    expect(within(mine).getByText(new RegExp(title))).toBeInTheDocument();
    expect(within(mine).getByText(/đã ẩn khỏi bảng kèo/)).toBeInTheDocument();
  });

  it("nhóm thiếu 2 người: vào nhóm xong còn thiếu 1", () => {
    render(
      <>
        <MyKeosSection />
        <BrowseKeos />
      </>
    );
    const card = screen.getByRole("article", { name: /Chạy nhóm bình minh Ba Son/ });
    expect(within(card).getByText(/Thiếu 2 người/)).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: "Tham gia" }));
    expect(screen.getByText(/đang thiếu 2\. Bạn vào xong còn thiếu 1\./)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Chấp nhận · Vào chat nhóm/ }));
    fireEvent.click(screen.getByRole("button", { name: "Đóng chat" }));
    const mine = screen.getByRole("region", { name: "Kèo của bạn" });
    expect(within(mine).getByText(/7\/8 người · còn thiếu 1/)).toBeInTheDocument();
  });

  it("tham gia kèo nhóm → chấp nhận xong mới được thêm vào chat nhóm (host + thành viên)", () => {
    render(<BrowseKeos />);
    fireEvent.click(screen.getAllByRole("button", { name: "Tham gia" })[0]!);
    const sheet = screen.getByRole("dialog", { name: "Tham gia kèo nhóm" });
    expect((within(sheet).getByLabelText("Tin nhắn xác nhận") as HTMLTextAreaElement).value).toMatch(/và cả nhóm!/);
    fireEvent.click(within(sheet).getByRole("button", { name: /Chấp nhận · Vào chat nhóm/ }));
    const chat = screen.getByRole("dialog", { name: "Chat kèo" });
    expect(within(chat).getByText(/^Chat nhóm · \d+ người/)).toBeInTheDocument();
    expect(within(chat).getByText(/đã được thêm vào nhóm\./)).toBeInTheDocument();
  });

  it("đóng bảng khi chưa chấp nhận → không vào chat, nút vẫn là Nhận kèo", () => {
    render(<BrowseKeos />);
    const before = screen.getAllByRole("button", { name: "Nhận kèo" }).length;
    fireEvent.click(screen.getAllByRole("button", { name: "Nhận kèo" })[0]!);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mở chat kèo" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Nhận kèo" }).length).toBe(before);
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
    expect(screen.getAllByText(/Ngày mai, (T\d|CN) \d{2}\/\d{2} · \d{2}:\d{2} – \d{2}:\d{2}/).length).toBeGreaterThan(0);

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

describe("Chi tiết buổi tập & bỏ ô UT tối thiểu", () => {
  beforeEach(() => window.localStorage.clear());

  it("form không còn ô điểm uy tín; đổi môn sang Gym hiện nhóm cơ, mức tạ, đỡ tạ", () => {
    render(<PersonalFlow />);
    expect(screen.queryByLabelText("Điểm uy tín tối thiểu")).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Pace" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Gym/ }));
    expect(screen.getByRole("group", { name: "Nhóm cơ" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Mức tạ" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Cần người đỡ tạ" })).toBeInTheDocument();
  });
});

describe("Cá nhân (tự tập)", () => {
  beforeEach(() => window.localStorage.clear());

  it("lưu kế hoạch riêng tư, có lịch nhắc, và mở được cho người khác", () => {
    render(<SoloFlow />);
    fireEvent.click(screen.getAllByRole("button", { name: /Landmark 81/ })[0]!);
    // chọn ngày cách 3 hôm để lời nhắc 20:00 tối hôm trước không bị trôi qua (chạy test lúc nào cũng đúng)
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    if (d.getMonth() !== new Date().getMonth()) fireEvent.click(screen.getByRole("button", { name: "Tháng sau" }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(label) }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu kế hoạch tự tập" }));
    expect(screen.getByText("Đã lưu kế hoạch tự tập")).toBeInTheDocument();
    expect(screen.getByText(/Không cộng, không trừ UT/)).toBeInTheDocument();
    expect(screen.getByTestId("reminders")).toHaveTextContent("20:00 tối");
    fireEvent.click(screen.getByRole("button", { name: "Mở cho người khác tập cùng" }));
    expect(screen.getByText(/Đã mở thành kèo 1:1/)).toBeInTheDocument();
  });
});

describe("Ô tìm kiếm địa điểm", () => {
  beforeEach(() => window.localStorage.clear());

  it("gõ không dấu → hiện kết quả, chọn được; gợi ý gần bạn vẫn hiện bên dưới", () => {
    render(<SoloFlow />);
    const box = screen.getByRole("searchbox", { name: "Tìm địa điểm" });
    expect(screen.getByText("Gợi ý gần bạn")).toBeInTheDocument();

    fireEvent.change(box, { target: { value: "nhieu loc" } });
    expect(screen.getByText(/Kết quả cho “nhieu loc”/)).toBeInTheDocument();
    const results = screen.getByLabelText("Kết quả tìm kiếm");
    fireEvent.click(within(results).getAllByRole("button", { name: /Nhiêu Lộc/ })[0]!);
    expect(screen.getByRole("button", { name: "Lưu kế hoạch tự tập" })).toBeEnabled();
    expect(screen.getByText("Gợi ý gần bạn")).toBeInTheDocument();

    fireEvent.change(box, { target: { value: "khong co dau ca" } });
    expect(screen.getByText(/Không tìm thấy/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xoá tìm kiếm" }));
    expect(screen.queryByLabelText("Kết quả tìm kiếm")).not.toBeInTheDocument();
  });
});

describe("Host từ chối người nhận kèo", () => {
  beforeEach(() => window.localStorage.clear());

  const seedHostKeo = (daysAhead: number) => {
    const t = new Date();
    t.setDate(t.getDate() + daysAhead);
    const day = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
    const keo = {
      id: "my-host-1",
      kind: "personal",
      hostId: "me",
      title: "Chạy bộ tại Landmark 81",
      sport: "running",
      place: { id: "p", name: "Landmark 81", area: "Bình Thạnh", position: [10.795, 106.721], image: "x.jpg" },
      time: { day, from: "06:00", to: "07:00" },
      capacity: 2,
      memberIds: ["me", "hoangnam"],
      note: "",
      minTrust: 0,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    window.localStorage.setItem("sync.keo.v1", JSON.stringify({ mine: [keo], joined: [], plans: [], chats: {}, defaults: {} }));
  };

  it("còn hơn 24 giờ: host mở chat, từ chối → người đó bị bỏ ra, kèo mở lại", () => {
    seedHostKeo(3);
    render(<MyKeosSection />);
    expect(screen.getByText(/Hoàng Nam đã nhận · từ chối được tới/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Mở chat/ }));
    const chat = screen.getByRole("dialog", { name: "Chat kèo" });
    fireEvent.click(within(chat).getByRole("button", { name: "Từ chối Hoàng Nam" }));
    fireEvent.click(within(chat).getByRole("button", { name: "Xác nhận từ chối" }));
    expect(within(chat).getByText(/Bạn đã từ chối Hoàng Nam\. .*không còn thấy kèo/)).toBeInTheDocument();
    expect(within(chat).getByText(/Chưa có ai nhận kèo/)).toBeInTheDocument();
    fireEvent.click(within(chat).getByRole("button", { name: "Đóng chat" }));
    expect(screen.getByText(/Đang chờ người nhận/)).toBeInTheDocument();
  });

  it("còn dưới 24 giờ: nút từ chối bị khoá", () => {
    seedHostKeo(0);
    render(<MyKeosSection />);
    fireEvent.click(screen.getByRole("button", { name: /Mở chat/ }));
    expect(screen.getByRole("button", { name: "Từ chối Hoàng Nam" })).toBeDisabled();
  });
});

describe("Kèo đã nhận: xem hồ sơ host và huỷ kèo", () => {
  beforeEach(() => window.localStorage.clear());

  it("Kèo của bạn có link hồ sơ host; Huỷ → màn huỷ có luật UT → rút khỏi kèo, kèo quay lại bảng", () => {
    render(
      <>
        <MyKeosSection />
        <BrowseKeos />
      </>
    );
    const card = screen.getByRole("article", { name: "Chạy 10km ven sông, pace 5:45" });
    fireEvent.click(within(card).getByRole("button", { name: "Nhận kèo" }));
    fireEvent.click(screen.getByRole("button", { name: /Chấp nhận kèo/ }));

    // trong chat: tên host bấm được, có nút hồ sơ host và huỷ
    const chat = screen.getByRole("dialog", { name: "Chat kèo" });
    expect(within(chat).getByRole("link", { name: "Xem hồ sơ host Hoàng Nam" })).toHaveAttribute("href", expect.stringMatching(/^\/nguoi-dung\//));
    expect(within(chat).getByRole("link", { name: "Hồ sơ host" })).toBeInTheDocument();
    expect(within(chat).getByRole("button", { name: "Huỷ kèo" })).toBeInTheDocument();
    fireEvent.click(within(chat).getByRole("button", { name: "Đóng chat" }));

    const mine = screen.getByRole("region", { name: "Kèo của bạn" });
    expect(within(mine).getByRole("link", { name: "Xem hồ sơ host Hoàng Nam" })).toHaveAttribute("href", expect.stringMatching(/^\/nguoi-dung\//));
    fireEvent.click(within(mine).getByRole("button", { name: /Huỷ kèo Chạy 10km/ }));

    // màn huỷ luôn hiện hậu quả UT trước khi bấm
    expect(screen.getByRole("status")).toHaveTextContent(/Huỷ bây giờ/);
    fireEvent.click(screen.getByRole("button", { name: /Rút khỏi kèo \(không bị trừ điểm\)|Huỷ một phía/ }));

    expect(screen.getByText(/^Đã rút khỏi "Chạy 10km ven sông, pace 5:45"/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Kèo của bạn" })).not.toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Chạy 10km ven sông, pace 5:45" })).toBeInTheDocument();
  });
});
