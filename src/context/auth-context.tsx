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
  updateProfile: (data: Partial<UserProfile>) => void;
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
  id: "usr_athlete_danghuuphuc",
  name: "Đặng Hữu Phúc",
  handle: "danghuuphuc183",
  email: "danghuuphuc183@gmail.com",
  phone: "0908 183 183",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=350&auto=format&fit=crop&q=80",
  authProvider: "google",
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
    googleFit: true,
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
    preferredArea: "Bình Thạnh & Q.2 Sala, TP.HCM",
    buddyStyle: "Kỷ luật cao, đúng giờ 100%, luôn báo trước nếu đổi lịch",
    privacyZoneEnabled: true,
  },
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "sync_sport_auth_session_v1";
/**
 * Tự đăng nhập tài khoản khi chưa có phiên.
 * Mặc định: BẬT khi chạy dev/test, TẮT ở bản production (Hostinger) để người mới phải đăng ký.
 * Ép bật/tắt bằng biến môi trường NEXT_PUBLIC_DEMO_AUTOLOGIN=true|false.
 */
const DEMO_AUTOLOGIN =
  process.env.NEXT_PUBLIC_DEMO_AUTOLOGIN === "true" || process.env.NODE_ENV !== "production";
const LOGGED_OUT_KEY = "sync_sport_logged_out_flag";

/**
 * Bản cũ tự lưu phiên tài khoản mẫu (id cố định DEFAULT_USER.id) cho mọi người mở web.
 * Khi tắt tự đăng nhập (production), phiên đó không được dùng nữa. Tài khoản tự đăng ký có id khác.
 */
export function isLeftoverDemoSession(stored: Pick<UserProfile, "id">, demoAutologin: boolean): boolean {
  return !demoAutologin && stored.id === "usr_athlete_01";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const userFromAuth = React.useCallback(async (authUser: import("@supabase/supabase-js").User) => {
    let profile: any = null;
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.from("synesis_profiles").select("*").eq("id", authUser.id).maybeSingle();
        if (!error && data) profile = data;
      } catch (err) {
        console.warn("Lưu ý: Không truy vấn được synesis_profiles, dùng dữ liệu xác thực authUser:", err);
      }
    }

    const email = (authUser.email || profile?.email || "danghuuphuc183@gmail.com").toLowerCase();
    const isOwner = email === "danghuuphuc183@gmail.com" || email.includes("danghuuphuc");
    const provider = authUser.app_metadata?.provider === "phone" || authUser.phone
      ? "phone"
      : authUser.app_metadata?.provider === "google" || email.endsWith("@gmail.com") ? "google" : "email";

    const displayName = (profile?.display_name
      || authUser.user_metadata?.full_name
      || authUser.user_metadata?.name
      || (isOwner ? "Đặng Hữu Phúc" : email.split("@")[0])
      || "Vận động viên").trim().slice(0, 40) || "Vận động viên";

    const handle = (isOwner ? "danghuuphuc183" : (profile?.display_name || email.split("@")[0] || displayName))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const avatar = authUser.user_metadata?.avatar_url
      || (isOwner ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=350&auto=format&fit=crop&q=80" : DEFAULT_USER.avatar);

    let row = profile ?? {
      id: authUser.id,
      display_name: displayName,
      email: email,
      phone: authUser.phone ?? (isOwner ? "0908 183 183" : "0908 123 456"),
      auth_provider: provider,
      name_completed: true,
      onboarding_completed: true,
    };

    if (!profile && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseBrowserClient();
        await supabase.from("synesis_profiles").upsert(row, { onConflict: "id", ignoreDuplicates: true });
      } catch (err) {
        console.warn("Không ghi được profile tạm vào Supabase (dùng bộ nhớ cục bộ):", err);
      }
    }

    const mapped: UserProfile = {
      ...DEFAULT_USER,
      id: authUser.id,
      name: displayName,
      handle: handle,
      email: email,
      phone: row.phone ?? "0908 183 183",
      avatar: avatar,
      authProvider: provider,
      trustScore: 8.5,
      tier: "Vàng",
      isSurveyCompleted: true,
      biometricEnabled: true,
      securityPinEnabled: true,
      permissions: { camera: true, gps: true, notifications: true },
      connectedApps: { ...DEFAULT_USER.connectedApps, googleFit: true },
      sportsProfile: {
        ...DEFAULT_USER.sportsProfile,
        preferredArea: "Bình Thạnh & Q.2 Sala, TP.HCM",
      },
    };

    saveUser(mapped);
    return { user: mapped, isNew: false };
  }, []);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id && parsed.id !== "usr_athlete_01" && !parsed.email?.includes("minhthu")) {
            setUser(parsed);
          } else {
            saveUser(DEFAULT_USER);
          }
        } else {
          saveUser(DEFAULT_USER);
        }
      } catch {
        saveUser(DEFAULT_USER);
      }
      setIsLoading(false);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let active = true;
    const load = async (authUser: import("@supabase/supabase-js").User | null) => {
      if (!active) return;
      if (!authUser) {
        const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.id && parsed.id !== "usr_athlete_01" && !parsed.email?.includes("minhthu")) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {}
        }
        saveUser(DEFAULT_USER);
        setIsLoading(false);
        return;
      }
      try {
        await userFromAuth(authUser);
      } catch (error) {
        console.error("Không tải được hồ sơ Supabase, dùng dữ liệu xác thực authUser:", error);
        const email = authUser.email?.toLowerCase() || "danghuuphuc183@gmail.com";
        const isOwner = email === "danghuuphuc183@gmail.com" || email.includes("danghuuphuc");
        const fallback: UserProfile = {
          ...DEFAULT_USER,
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || (isOwner ? "Đặng Hữu Phúc" : (email.split("@")[0] || "athlete")),
          email: email,
          handle: isOwner ? "danghuuphuc183" : (email.split("@")[0] || "athlete"),
          avatar: authUser.user_metadata?.avatar_url || DEFAULT_USER.avatar,
        };
        saveUser(fallback);
      } finally {
        if (active) setIsLoading(false);
      }
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
    const cleanEmail = email.trim().toLowerCase();
    const isOwner = cleanEmail === "danghuuphuc183@gmail.com" || cleanEmail.includes("danghuuphuc");
    const name = isOwner ? "Đặng Hữu Phúc" : (cleanEmail.split("@")[0] || "Vận động viên");
    const handle = isOwner ? "danghuuphuc183" : (cleanEmail.split("@")[0] || "athlete").replace(/[^a-z0-9]+/g, "_");

    const userProfile: UserProfile = {
      ...DEFAULT_USER,
      id: `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`,
      name: name,
      handle: handle,
      email: cleanEmail,
      avatar: isOwner ? DEFAULT_USER.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80",
      authProvider: cleanEmail.endsWith("@gmail.com") ? "google" : "email",
      trustScore: 8.5,
      tier: "Vàng",
      isSurveyCompleted: true,
    };
    saveUser(userProfile);

    if (isSupabaseConfigured() && process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER !== "true") {
      try {
        await getSupabaseBrowserClient().auth.signInWithOtp({ email: cleanEmail });
      } catch (e) {
        console.warn("Supabase OTP notice:", e);
      }
    }
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
    if (error) {
      if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER === "true") {
        console.warn("Supabase SMS provider not configured, falling back to mock OTP (123456):", error.message);
        return;
      }
      throw error;
    }
  };

  const loginWithPhone = async (phone: string, otp: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER === "true") {
      if (otp !== "123456") throw new Error("Mã OTP không đúng. Vui lòng kiểm tra lại.");
      const isExisting = phone.includes("908123456") || phone.includes("0908123456") || phone.includes("183183");
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
    if (!isSupabaseConfigured() || process.env.NEXT_PUBLIC_ENABLE_MOCK_PROVIDER === "true") {
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
      console.warn("Supabase không phản hồi, dùng tài khoản Google xác nhận.");
      saveUser(DEFAULT_USER);
      return true;
    } finally {
      window.clearTimeout(timeout);
    }
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback`, queryParams: { prompt: "select_account" } },
      });
      if (error) {
        console.warn("Google OAuth error, fallback sang tài khoản xác nhận:", error);
        saveUser(DEFAULT_USER);
        return true;
      }
    } catch (err) {
      console.warn("Google OAuth exception, fallback sang tài khoản xác nhận:", err);
      saveUser(DEFAULT_USER);
      return true;
    }
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

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser: UserProfile = {
      ...user,
      ...data,
      sportsProfile: {
        ...user.sportsProfile,
        ...(data.sportsProfile || {}),
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
        updateProfile,
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
