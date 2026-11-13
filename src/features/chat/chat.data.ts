export interface ChatMessage {
  id: string;
  senderId: string; // "current_user" | partner id
  senderName: string;
  senderAvatar: string;
  text?: string;
  timestamp: string;
  isRead?: boolean;
  liked?: boolean;
  attachment?: {
    type: "appointment" | "route" | "photo";
    title: string;
    subTitle: string;
    detail: string;
    imageUrl?: string;
    actionLabel?: string;
    actionHref?: string;
  };
}

export interface ChatConversation {
  id: string;
  type: "direct" | "group";
  partner: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    isOnline: boolean;
    lastActiveVi: string;
    trustScore: number;
    tier: "diamond" | "gold" | "silver";
    sportVi: string;
  };
  lastMessage: string;
  lastMessageTimeVi: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-1",
    type: "direct",
    partner: {
      id: "partner-hoangnam",
      name: "Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      handle: "@hoangnam_run",
      isOnline: true,
      lastActiveVi: "Đang hoạt động",
      trustScore: 9,
      tier: "diamond",
      sportVi: "Chạy bộ • Pace 5:30",
    },
    lastMessage: "Mai gặp nhau ở Cổng bến thuyền Landmark 81 lúc 5:30 nhé bạn!",
    lastMessageTimeVi: "Vừa xong",
    unreadCount: 1,
    messages: [
      {
        id: "msg-101",
        senderId: "partner-hoangnam",
        senderName: "Hoàng Nam",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        text: "Chào bạn! Mình thấy bạn nhận lịch hẹn chạy 10km sáng mai. Rất vui được kéo pace cùng bạn!",
        timestamp: "18:20",
        isRead: true,
      },
      {
        id: "msg-102",
        senderId: "current_user",
        senderName: "Minh Thư",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        text: "Chào Nam! Mình đang duy trì pace 5:45 - 6:00, mai nhờ bạn giữ nhịp đều giúp mình nhé.",
        timestamp: "18:22",
        isRead: true,
      },
      {
        id: "msg-103",
        senderId: "partner-hoangnam",
        senderName: "Hoàng Nam",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        timestamp: "18:24",
        isRead: true,
        attachment: {
          type: "appointment",
          title: "Khế Ước Buổi Chạy Sáng Mai",
          subTitle: "05:30 AM • Cổng Bến Thuyền Landmark 81",
          detail: "10.0 km • Pace 5:30 - 5:45 • Đã chốt kèo",
          imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&auto=format&fit=crop&q=80",
          actionLabel: "Xem trên Bản Đồ",
          actionHref: "/ban-do",
        },
      },
      {
        id: "msg-104",
        senderId: "current_user",
        senderName: "Minh Thư",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        text: "Đã xác nhận khế ước! Mình đã chuẩn bị sẵn đồng hồ Garmin và bình nước.",
        timestamp: "18:25",
        isRead: true,
        liked: true,
      },
      {
        id: "msg-105",
        senderId: "partner-hoangnam",
        senderName: "Hoàng Nam",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        text: "Mai gặp nhau ở Cổng bến thuyền Landmark 81 lúc 5:30 nhé bạn!",
        timestamp: "18:28",
        isRead: false,
      },
    ],
  },
  {
    id: "conv-2",
    type: "direct",
    partner: {
      id: "partner-thuydung",
      name: "Thuỳ Dung",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      handle: "@thuydung_gym",
      isOnline: true,
      lastActiveVi: "Hoạt động 5 phút trước",
      trustScore: 8,
      tier: "gold",
      sportVi: "Gym • Đỡ tạ Spotter",
    },
    lastMessage: "Chiều mai 18:00 tại The New Gym Võ Văn Ngân nhé bạn ơi!",
    lastMessageTimeVi: "15p",
    unreadCount: 0,
    messages: [
      {
        id: "msg-201",
        senderId: "partner-thuydung",
        senderName: "Thuỳ Dung",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        text: "Hi bạn! Mình đang tập leg day cần người đỡ mức Squat 70kg, bạn quen đỡ tạ đòn không?",
        timestamp: "15:10",
        isRead: true,
      },
      {
        id: "msg-202",
        senderId: "current_user",
        senderName: "Minh Thư",
        senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        text: "Mình quen đỡ bài Squat và Bench Press nhé. Đổi lượt nhau đỡ cho an toàn!",
        timestamp: "15:15",
        isRead: true,
      },
      {
        id: "msg-203",
        senderId: "partner-thuydung",
        senderName: "Thuỳ Dung",
        senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        text: "Chiều mai 18:00 tại The New Gym Võ Văn Ngân nhé bạn ơi!",
        timestamp: "15:16",
        isRead: true,
        liked: true,
      },
    ],
  },
  {
    id: "conv-3",
    type: "direct",
    partner: {
      id: "partner-quocanh",
      name: "Quốc Anh",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      handle: "@quocanh_pickleball",
      isOnline: false,
      lastActiveVi: "Hoạt động 1 giờ trước",
      trustScore: 8.5,
      tier: "gold",
      sportVi: "Pickleball • DUPR 3.5",
    },
    lastMessage: "Đã book sân D-Court số 3 từ 19h đến 21h rồi nhé!",
    lastMessageTimeVi: "1h",
    unreadCount: 0,
    messages: [
      {
        id: "msg-301",
        senderId: "partner-quocanh",
        senderName: "Quốc Anh",
        senderAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        text: "Đã book sân D-Court số 3 từ 19h đến 21h rồi nhé! Mình mang thêm bóng Franklin X-40.",
        timestamp: "14:00",
        isRead: true,
      },
    ],
  },
  {
    id: "conv-4",
    type: "group",
    partner: {
      id: "group-squad1",
      name: " Saigon Runners Squad #01",
      avatar: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=150&auto=format&fit=crop&q=80",
      handle: "@squad_landmark81",
      isOnline: true,
      lastActiveVi: "4 thành viên đang online",
      trustScore: 9.5,
      tier: "diamond",
      sportVi: "Micro-Squad 4 người",
    },
    lastMessage: "Tuấn Kiệt: Chủ nhật này ai chạy cự ly 15km không?",
    lastMessageTimeVi: "2h",
    unreadCount: 2,
    messages: [
      {
        id: "msg-401",
        senderId: "partner-hoangnam",
        senderName: "Hoàng Nam",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        text: "Cả nhóm sáng nay check-in đủ 4/4 người, mỗi người được +0,5 UT!",
        timestamp: "07:05",
        isRead: true,
      },
      {
        id: "msg-402",
        senderId: "user-tuankiet",
        senderName: "Tuấn Kiệt",
        senderAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
        text: "Chủ nhật này ai chạy cự ly 15km không?",
        timestamp: "09:30",
        isRead: false,
      },
    ],
  },
];
