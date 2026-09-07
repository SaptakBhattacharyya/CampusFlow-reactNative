import React, { useState } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useSSO, useClerk } from "@clerk/expo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

// Complete any pending web auth sessions
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  // Warm up the Android browser for smooth OAuth redirect handling
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const signInWithGoogle = async (declaredRole = "User") => {
    try {
      setIsGoogleLoading(true);

      // Check if Clerk already has an active signed-in user session
      const existingUser = clerk.user || clerk.session?.user || clerk.client?.sessions?.[0]?.user;
      const existingEmail =
        existingUser?.primaryEmailAddress?.emailAddress ||
        existingUser?.emailAddresses?.[0]?.emailAddress;

      if (existingEmail) {
        console.log("Existing Clerk session detected for:", existingEmail);
        try {
          await loginWithGoogle({
            email: existingEmail,
            fullName:
              existingUser?.fullName ||
              [existingUser?.firstName, existingUser?.lastName].filter(Boolean).join(" ") ||
              "Google User",
            googleId: existingUser?.id || clerk.session?.id || "google_existing",
            profilePic: existingUser?.imageUrl || "",
            role: declaredRole,
          });

          router.replace("/(drawer)/(tabs)");
          return;
        } catch (syncErr) {
          console.log("Syncing existing session failed, resetting Clerk:", syncErr.message);
          try {
            await clerk.signOut();
          } catch (_) {}
        }
      } else if (clerk.session || clerk.user) {
        // Clear any empty or invalid lingering Clerk session
        try {
          await clerk.signOut();
        } catch (_) {}
      }

      const redirectUrl = AuthSession.makeRedirectUri();
      console.log("OAuth Redirect URL:", redirectUrl);

      const { createdSessionId, setActive, signIn, signUp, authSessionResult } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl,
      });

      console.log("startSSOFlow result:", {
        createdSessionId,
        authSessionResult,
        signInStatus: signIn?.status,
        signUpStatus: signUp?.status,
      });

      const effectiveSessionId = createdSessionId || signIn?.createdSessionId || signUp?.createdSessionId;

      if (effectiveSessionId) {
        if (setActive) {
          await setActive({ session: effectiveSessionId });
        }

        // Get user details from clerk session or client user
        const client = clerk.client;
        const session = client?.sessions?.find((s) => s.id === createdSessionId);
        const clerkUser = session?.user || client?.user || clerk.user;

        const email =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          signIn?.identifier ||
          "";
        const fullName =
          clerkUser?.fullName ||
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
          "Google User";
        const profilePic = clerkUser?.imageUrl || "";
        const googleId = clerkUser?.id || signIn?.createdUserId || effectiveSessionId;

        if (!email) {
          throw new Error("Unable to retrieve email from Google account");
        }

        // Sync with our Express/MongoDB backend and save JWT
        await loginWithGoogle({
          email,
          fullName,
          googleId,
          profilePic,
          role: declaredRole,
        });

        router.replace("/(drawer)/(tabs)");
      } else {
        console.log("OAuth completed without session id:", { signIn, signUp, status: signIn?.status || signUp?.status });
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        "";

      // Self-healing: If Clerk throws "already signed in", recover session or clean it up
      if (
        msg.toLowerCase().includes("already signed in") ||
        msg.toLowerCase().includes("session already exists")
      ) {
        try {
          const client = clerk.client;
          const clerkUser = clerk.user || client?.user || client?.sessions?.[0]?.user;
          const email =
            clerkUser?.primaryEmailAddress?.emailAddress ||
            clerkUser?.emailAddresses?.[0]?.emailAddress;

          if (email) {
            await loginWithGoogle({
              email,
              fullName:
                clerkUser?.fullName ||
                [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
                "Google User",
              googleId: clerkUser?.id || "google_recovered",
              profilePic: clerkUser?.imageUrl || "",
              role: declaredRole,
            });

            router.replace("/(drawer)/(tabs)");
            return;
          }

          // If no user could be recovered, sign out of Clerk and notify user to tap once more
          await clerk.signOut();
          Alert.alert(
            "Session Cleared",
            "Your previous Google session was cleared. Please tap 'Sign in with Google' again."
          );
          return;
        } catch (recoveryErr) {
          console.error("Recovery error:", recoveryErr);
          try {
            await clerk.signOut();
          } catch (_) {}
        }
      }

      // Only alert if not user cancellation
      if (!msg.toLowerCase().includes("cancel") && !msg.toLowerCase().includes("dismiss")) {
        Alert.alert(
          "Google Authentication",
          msg || "Failed to authenticate with Google."
        );
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isGoogleLoading,
  };
};
