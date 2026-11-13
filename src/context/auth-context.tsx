"use client";

import * as React from "react";
import { UT_CONFIG, legacyTsToUt } from "@/features/trust/config";

export interface UserPermissions {
  camera: boolean;
  gps: boolean;
  notifications: boolean;
}

export interface ConnectedApps {
  strava: boolean;
  appleHealth: boolean;
  garmin: boolean;
  coros: boolean;
  whoop: boolean;
  googleFit: boolean;
  nikeRunClub: boolean;
  samsungHealth?: boolean;
  healthConnect?: boolean;
  hevy?: boolean;
  huaweiHealth?: boolean;
  polar?: boolean;
}

export interface UserSportsProfile {
  preferredSports: string[];
  fitnessGoal: string;
  runningPace: string;
  maxDistance: string;
  gymExperience: string;
  racketLevel: string;
  preferredTime: string;
  workoutFrequency: string;
  preferredArea: string;
  buddyStyle: string;
  privacyZoneEnabled: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  email: string;
  phone: string;
  avatar: string;
  authProvider: "email" | "phone" | "facebook" | "google" | "apple" | "strava";
  trustScore: number;
  tier: "Vàng" | "Kim Cương" | "Bạc";
  isSurveyCompleted: boolean;
  biometricEnabled: boolean;
  securityPinEnabled: boolean;
  securityPin?: string;
  permissions: UserPermissions;
  connectedApps: ConnectedApps;
  sportsProfile: UserSportsProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass?: string) => Promise<boolean>;
  loginWithPhone: (phone: string, otp: string) => Promise<boolean>;
  loginWithSocial: (provider: "facebook" | "google" | "apple" | "strava") => Promise<boolean>;
  register: (data: { name: string; email?: string; phone?: string; provider?: "email" | "phone" | "facebook" | "google" | "apple" | "strava" }) => Promise<boolean>;
  logout: () => void;
  updateSurvey: (profile: Partial<UserSportsProfile>) => void;
  /** Lưu toàn bộ kết quả onboarding trong MỘT lần ghi (tránh ghi đè lẫn nhau) */
  completeOnboarding: (data: {
    name?: string;
    sportsProfile: Partial<UserSportsProfile>;
    permissions: Partial<UserPermissions>;
    connectedApps: Partial<ConnectedApps>;
  }) => void;
  updatePermissions: (perms: Partial<UserPermissions>) => void;
  toggleAppConnection: (app: keyof ConnectedApps, state?: boolean) => void;
  toggleBiometric: () => void;
  togglePrivacyZone: () => void;
  setSecurityPin: (pin: string) => void;
}

const DEFAULT_USER: UserProfile = {
  id: "usr_athlete_01",
  name: "Minh Thư",
  handle: "minhthu_runner",
  email: "minhthu.sport@sync.vn",
  phone: "0908 123 456",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  authProvider: "phone",
  trustScore: 8.5,
  tier: "Vàng",
  isSurveyCompleted: true,
  biometricEnabled: true,
  securityPinEnabled: true,
  permissions: {
    camera: true,
    gps: true,
    notifications: true,
  },
  connectedApps: {
    strava: true,
    appleHealth: true,
    garmin: false,
    coros: false,
    whoop: false,
    googleFit: false,
    nikeRunClub: false,
  },
  sportsProfile: {
    preferredSports: ["running", "gym"],
    fitnessGoal: "Duy trì kỷ luật & Chinh phục cự ly Half Marathon 21km",
    runningPace: "5:30 - 5:45/km",
    maxDistance: "21.1 km (Half Marathon)",
    gymExperience: "1 - 2 năm (Squat 75kg)",
    racketLevel: "Tân binh",
    preferredTime: "05:30 - 06:45 AM (Sáng sớm)",
    workoutFrequency: "4 buổi / tuần",
    preferredArea: "Bình Thạnh & Q.1 (Ven sông Sài Gòn, Landmark 81)",
    buddyStyle: "Kỷ luật cao, đúng giờ 100%, luôn báo trước nếu đổi lịch",
    privacyZoneEnabled: true,
  },
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sync_sport_auth_session_v1";
/**
 * Tự đăng nhập tài khoản mẫu "Minh Thư" khi chưa có phiên.
 * Mặc định: BẬT khi chạy dev/test, TẮT ở bản production (Hostinger) để người mới phải đăng ký.
 * Ép bật/tắt bằng biến môi trường NEXT_PUBLIC_DEMO_AUTOLOGIN=true|false.
 */
const DEMO_AUTOLOGIN =
  process.env.NEXT_PUBLIC_DEMO_AUTOLOGIN !== undefined
    ? process.env.NEXT_PUBLIC_DEMO_AUTOLOGIN === "true"
    : process.env.NODE_ENV !== "production";
const LOGGED_OUT_KEY = "sync_sport_logged_out_flag";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      const isLoggedOut = localStorage.getItem(LOGGED_OUT_KEY);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        // Dữ liệu cũ theo thang TS 0–150 → quy đổi sang UT 0–10
        if (parsed.trustScore > UT_CONFIG.MAX) parsed.trustScore = legacyTsToUt(parsed.trustScore);
        setUser(parsed);
      } else if (isLoggedOut === "true" || !DEMO_AUTOLOGIN) {
        // Bản chạy thật (production): người mới phải tự đăng ký / đăng nhập
        setUser(null);
      } else {
        // Chỉ khi chạy trên máy (dev): tự đăng nhập tài khoản mẫu để thử nhanh
        setUser(DEFAULT_USER);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER));
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    try {
      if (updatedUser) {
        localStorage.removeItem(LOGGED_OUT_KEY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } else {
        localStorage.setItem(LOGGED_OUT_KEY, "true");
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Storage error:", e);
    }
  };

  const loginWithEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      id: `usr_${Date.now()}`,
      email,
      name: email.split("@")[0] || "Vận Động Viên",
      authProvider: "email",
    };
    saveUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithPhone = async (phone: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newUser: UserProfile = {
      ...DEFAULT_USER,
      id: `usr_${Date.now()}`,
      phone,
      authProvider: "phone",
    };
    saveUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithSocial = async (provider: "facebook" | "google" | "apple" | "strava"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    let name = "Vận Động Viên";
    let email = "athlete@sync.vn";
    let avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    const connectedApps = { ...DEFAULT_USER.connectedApps };

    if (provider === "facebook") {
      name = "Hoàng Nam";
      email = "hoangnam@facebook.com";
      avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80";
    } else if (provider === "google") {
      name = "Minh Thư";
      email = "minhthu.run@gmail.com";
      avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";
    } else if (provider === "apple") {
      name = "Tuấn Kiệt";
      email = "tuankiet.apple@privaterelay.appleid.com";
      avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80";
      connectedApps.appleHealth = true;
    } else if (provider === "strava") {
      name = "Thảo My (Strava)";
      email = "thaomy@athlete.strava.com";
      avatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80";
      connectedApps.strava = true;
    }

    const newUser: UserProfile = {
      ...DEFAULT_USER,
      id: `usr_${provider}_${Date.now()}`,
      name,
      email,
      avatar,
      authProvider: provider,
      connectedApps,
    };
    saveUser(newUser);
    setIsLoading(false);
    return true;
  };

  const register = async (data: {
    name: string;
    email?: string;
    phone?: string;
    provider?: "email" | "phone" | "facebook" | "google" | "apple" | "strava";
  }): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const newUser: UserProfile = {
      id: `usr_new_${Date.now()}`,
      name: data.name || "Vận Động Viên Mới",
      handle: (data.name || "athlete").toLowerCase().replace(/\s+/g, "_") + Math.floor(Math.random() * 900 + 100),
      email: data.email || "athlete@sync.vn",
      phone: data.phone || "0987 654 321",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      authProvider: data.provider || "phone",
      trustScore: UT_CONFIG.INITIAL, // mọi tài khoản mới bắt đầu ở 7 UT
      tier: "Bạc",
      isSurveyCompleted: false, // Cần làm khảo sát onboarding
      biometricEnabled: false,
      securityPinEnabled: false,
      permissions: {
        camera: false,
        gps: false,
        notifications: false,
      },
      connectedApps: {
        strava: false,
        appleHealth: false,
        garmin: false,
        coros: false,
        whoop: false,
        googleFit: false,
        nikeRunClub: false,
      },
      sportsProfile: {
        preferredSports: [],
        fitnessGoal: "",
        runningPace: "",
        maxDistance: "",
        gymExperience: "",
        racketLevel: "",
        preferredTime: "",
        workoutFrequency: "",
        preferredArea: "TP. Hồ Chí Minh",
        buddyStyle: "Kỷ luật cao, đúng giờ",
        privacyZoneEnabled: true,
      },
    };
    saveUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    saveUser(null);
  };

  const updateSurvey = (profileData: Partial<UserSportsProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      isSurveyCompleted: true,
      sportsProfile: {
        ...user.sportsProfile,
        ...profileData,
      },
    };
    saveUser(updatedUser);
  };

  const completeOnboarding: AuthContextType["completeOnboarding"] = (data) => {
    if (!user) return;
    saveUser({
      ...user,
      name: data.name || user.name,
      isSurveyCompleted: true,
      sportsProfile: { ...user.sportsProfile, ...data.sportsProfile },
      permissions: { ...user.permissions, ...data.permissions },
      connectedApps: { ...(user.connectedApps || DEFAULT_USER.connectedApps), ...data.connectedApps },
    });
  };

  const updatePermissions = (perms: Partial<UserPermissions>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      permissions: {
        ...user.permissions,
        ...perms,
      },
    };
    saveUser(updatedUser);
  };

  const toggleAppConnection = (app: keyof ConnectedApps, state?: boolean) => {
    if (!user) return;
    const currentState = user.connectedApps?.[app] ?? false;
    const newState = state !== undefined ? state : !currentState;
    const updatedUser: UserProfile = {
      ...user,
      connectedApps: {
        ...(user.connectedApps || DEFAULT_USER.connectedApps),
        [app]: newState,
      },
    };
    saveUser(updatedUser);
  };

  const toggleBiometric = () => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      biometricEnabled: !user.biometricEnabled,
    };
    saveUser(updatedUser);
  };

  const togglePrivacyZone = () => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      sportsProfile: {
        ...user.sportsProfile,
        privacyZoneEnabled: !user.sportsProfile.privacyZoneEnabled,
      },
    };
    saveUser(updatedUser);
  };

  const setSecurityPin = (pin: string) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      securityPinEnabled: !!pin,
      securityPin: pin,
    };
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        loginWithPhone,
        loginWithSocial,
        register,
        logout,
        updateSurvey,
        completeOnboarding,
        updatePermissions,
        toggleAppConnection,
        toggleBiometric,
        togglePrivacyZone,
        setSecurityPin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
