"use client";

import * as React from "react";
import { UT_CONFIG } from "@/features/trust/config";
import { getSupabaseBrowserClient, getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/client";

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
  sendPhoneOtp: (phone: string, captchaToken?: string) => Promise<void>;
  /** Returns true when an existing profile was found, false for a newly verified identity. */
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
  process.env.NEXT_PUBLIC_DEMO_AUTOLOGIN === "true" && process.env.NODE_ENV !== "production";
const LOGGED_OUT_KEY = "sync_sport_logged_out_flag";

/**
 * Bản cũ tự lưu phiên tài khoản mẫu (id cố định DEFAULT_USER.id) cho mọi người mở web.
 * Khi tắt tự đăng nhập (production), phiên đó không được dùng nữa. Tài khoản tự đăng ký có id khác.
 */
export function isLeftoverDemoSession(stored: Pick<UserProfile, "id">, demoAutologin: boolean): boolean {
  return !demoAutologin && stored.id === DEFAULT_USER.id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const userFromAuth = React.useCallback(async (authUser: import("@supabase/supabase-js").User) => {
    const supabase = getSupabaseBrowserClient();
    const { data: profile, error } = await supabase.from("synesis_profiles").select("*").eq("id", authUser.id).maybeSingle();
    if (error) throw error;
    const provider = authUser.app_metadata.provider === "phone" || authUser.phone
      ? "phone"
      : authUser.app_metadata.provider === "google" ? "google" : "email";
    const displayName = (profile?.display_name
      || authUser.user_metadata.full_name
      || authUser.user_metadata.name
      || authUser.email?.split("@")[0]
      || "Vận động viên").trim().slice(0, 40) || "Vận động viên";
    let row = profile ?? {
      id: authUser.id,
      display_name: displayName,
      email: authUser.email?.toLowerCase() ?? null,
      phone: authUser.phone ?? null,
      auth_provider: provider,
      name_completed: provider === "google" && Boolean(authUser.user_metadata.full_name || authUser.user_metadata.name),
      onboarding_completed: false,
    };
    if (!profile) {
      const { error: insertError } = await supabase.from("synesis_profiles").upsert(row, { onConflict: "id", ignoreDuplicates: true });
      if (insertError) {
        if (insertError.message.includes("SYNESIS_REGISTRATION_LIMIT_REACHED")) {
          throw new Error("Đợt dùng thử SYNESIS đã đủ 10 tài khoản. Tài khoản mới hiện chưa thể đăng ký.");
        }
        throw insertError;
      }
      const { data: savedProfile, error: readError } = await supabase.from("synesis_profiles").select("*").eq("id", authUser.id).single();
      if (readError) throw readError;
      row = savedProfile;
    }
    const mapped: UserProfile = {
      ...DEFAULT_USER,
      id: authUser.id,
      name: row.display_name,
      handle: (row.display_name || "athlete").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""),
      email: row.email ?? "",
      phone: row.phone ?? "",
      avatar: authUser.user_metadata.avatar_url ?? "",
      authProvider: row.auth_provider,
      trustScore: UT_CONFIG.INITIAL,
      tier: "Bạc",
      isSurveyCompleted: row.onboarding_completed,
      biometricEnabled: false,
      securityPinEnabled: false,
      permissions: { camera: false, gps: false, notifications: false },
      connectedApps: { strava: false, appleHealth: false, garmin: false, coros: false, whoop: false, googleFit: false, nikeRunClub: false },
      sportsProfile: {
        preferredSports: [], fitnessGoal: "", runningPace: "", maxDistance: "", gymExperience: "",
        racketLevel: "", preferredTime: "", workoutFrequency: "", preferredArea: "",
        buddyStyle: "", privacyZoneEnabled: true,
      },
    };
    setUser(mapped);
    return { user: mapped, isNew: !profile || !profile.name_completed };
  }, []);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        if (DEMO_AUTOLOGIN) setUser(DEFAULT_USER);
        else setUser(null);
      } catch { setUser(null); }
      setIsLoading(false);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let active = true;
    const load = async (authUser: import("@supabase/supabase-js").User | null) => {
      if (!active) return;
      if (!authUser) { setUser(DEMO_AUTOLOGIN ? DEFAULT_USER : null); setIsLoading(false); return; }
      try { await userFromAuth(authUser); }
      catch (error) { console.error("Không tải được hồ sơ Supabase:", error); setUser(null); }
      finally { if (active) setIsLoading(false); }
    };
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Không tải được phiên đăng nhập:", error);
      return load(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      void load(session?.user ?? null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [userFromAuth]);

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
    const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({ email: email.trim().toLowerCase() });
    if (error) throw error;
    return true;
  };

  const sendPhoneOtp = async (phone: string, captchaToken?: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }
    if (process.env.NODE_ENV === "production" && !captchaToken) {
      throw new Error("Vui lòng hoàn tất xác minh bảo mật trước khi nhận mã SMS.");
    }
    const { error } = await getSupabaseBrowserClient().auth.signInWithOtp({ phone, options: { captchaToken } });
    if (error) throw error;
  };

  const loginWithPhone = async (phone: string, otp: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      if (otp !== "123456") throw new Error("Mã OTP không đúng. Vui lòng kiểm tra lại.");
      const isExisting = phone.includes("908123456") || phone.includes("0908123456");
      if (isExisting) {
        saveUser(DEFAULT_USER);
        return true;
      }
      return false;
    }
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
    if (error) throw error;
    if (!data.user) throw new Error("Không xác minh được tài khoản. Vui lòng thử lại.");
    const { isNew } = await userFromAuth(data.user);
    return !isNew;
  };

  const loginWithSocial = async (provider: "facebook" | "google" | "apple" | "strava"): Promise<boolean> => {
    if (provider !== "google") throw new Error("Hiện chỉ hỗ trợ Google và số điện thoại.");
    if (!isSupabaseConfigured()) {
      saveUser(DEFAULT_USER);
      return true;
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    const { anonKey: publishableKey } = getSupabaseConfig();
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    try {
      const health = await fetch(`${supabaseUrl}/auth/v1/health`, {
        method: "GET",
        cache: "no-store",
        headers: { apikey: publishableKey },
        signal: controller.signal,
      });
      if (!health.ok) throw new Error("Supabase đang không sẵn sàng.");
    } catch {
      throw new Error("Không kết nối được máy chủ đăng nhập Supabase. Vui lòng khởi động Supabase hoặc kiểm tra cấu hình rồi thử lại.");
    } finally {
      window.clearTimeout(timeout);
    }
    const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
    });
    if (error) throw error;
    return true;
  };

  const register = async (data: {
    name: string;
    email?: string;
    phone?: string;
    provider?: "email" | "phone" | "facebook" | "google" | "apple" | "strava";
  }): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        id: `usr_${Date.now()}`,
        name: data.name.trim(),
        handle: data.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
        phone: data.phone || "",
        email: data.email || "",
        authProvider: data.provider || "phone",
        isSurveyCompleted: false,
      };
      saveUser(newUser);
      return true;
    }
    const supabase = getSupabaseBrowserClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error("Phiên xác minh đã hết hạn. Vui lòng đăng nhập lại.");
    const { error } = await supabase.from("synesis_profiles").upsert({
      id: authUser.id,
      display_name: data.name.trim(),
      email: authUser.email?.toLowerCase() ?? null,
      phone: authUser.phone ?? null,
      auth_provider: authUser.phone ? "phone" : (authUser.app_metadata.provider === "google" ? "google" : "email"),
      name_completed: true,
      onboarding_completed: false,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await userFromAuth(authUser);
    return true;
  };

  const logout = () => {
    if (isSupabaseConfigured()) void getSupabaseBrowserClient().auth.signOut();
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
    const displayName = data.name || user.name;
    saveUser({
      ...user,
      name: displayName,
      isSurveyCompleted: true,
      sportsProfile: { ...user.sportsProfile, ...data.sportsProfile },
      permissions: { ...user.permissions, ...data.permissions },
      connectedApps: { ...(user.connectedApps || DEFAULT_USER.connectedApps), ...data.connectedApps },
    });
    if (isSupabaseConfigured()) {
      void getSupabaseBrowserClient().from("synesis_profiles").update({
        display_name: displayName,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id).then(({ error }) => {
        if (error) console.error("Không lưu được trạng thái onboarding:", error);
      });
    }
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
        sendPhoneOtp,
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
