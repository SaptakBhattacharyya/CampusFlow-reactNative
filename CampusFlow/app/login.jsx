import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { RoleSelector } from "@/components/common/RoleSelector";

const Login = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();

  // Form states
  const [selectedRole, setSelectedRole] = useState("User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active input highlight
  const [focusedInput, setFocusedInput] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Required Fields", "Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email.trim(), password, selectedRole);
      router.replace("/(drawer)/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    signInWithGoogle(selectedRole);
  };

  const handleForgotPassword = () => {
    Alert.alert("Forgot Password", "Password reset instructions will be sent to your email.");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ================= TOP HERO SECTION ================= */}
          <ImageBackground
            source={require("@/assets/images/campus-bg.jpg")}
            style={styles.heroBackground}
            imageStyle={styles.heroImage}
          >
            <SafeAreaView edges={["top"]} style={styles.topBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/(drawer)/(tabs)"))}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={22} color="#1E293B" />
              </TouchableOpacity>
            </SafeAreaView>
          </ImageBackground>

          {/* ================= WHITE CARD CONTAINER ================= */}
          <View style={styles.cardContainer}>
            {/* Floating Shield Logo Badge */}
            <View style={styles.logoBadgeContainer}>
              <View style={styles.logoBadge}>
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={styles.shieldIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Brand Title & Subtitle */}
            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>CampusFlow</Text>
              <Text style={styles.brandSubtitle}>Better Campus, Better You</Text>
            </View>

            {/* Form Title & Subtitle */}
            <View style={styles.headingSection}>
              <Text style={styles.mainHeading}>Welcome Back</Text>
              <Text style={styles.subHeading}>
                Login to continue and stay updated with your campus
              </Text>
            </View>

            {/* ================= FORM INPUTS ================= */}
            <View style={styles.formSection}>
              {/* Role Selector */}
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                title="Select Role"
              />

              {/* Email Address */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "email" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={focusedInput === "email" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#7B9AA5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

              {/* Password */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "password" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={focusedInput === "password" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#7B9AA5"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#7B9AA5"
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={19} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                disabled={isGoogleLoading}
                activeOpacity={0.75}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#1D7A78" size="small" />
                ) : (
                  <>
                    <AntDesign name="google" size={19} color="#EA4335" />
                    <Text style={styles.googleButtonText}>Sign In with Google</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom Register Prompt */}
            <View style={styles.bottomPromptRow}>
              <Text style={styles.bottomPromptText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.bottomPromptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Subtle Campus Graphic Footer */}
            <View style={styles.illustrationWrapper}>
              <ImageBackground
                source={require("@/assets/images/campus-bg.jpg")}
                style={styles.campusIllustration}
                imageStyle={styles.illustrationImage}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F7",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroBackground: {
    width: "100%",
    height: 190,
  },
  heroImage: {
    opacity: 0.85,
    resizeMode: "cover",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 12 : 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(18, 60, 74, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: -38,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 46,
    paddingBottom: 24,
    shadowColor: "rgba(18, 60, 74, 0.08)",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoBadgeContainer: {
    position: "absolute",
    top: -42,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  logoBadge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(18, 60, 74, 0.12)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  shieldIcon: {
    width: 58,
    height: 58,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102A35",
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#527986",
    fontWeight: "500",
    marginTop: 2,
  },
  headingSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  mainHeading: {
    fontSize: 22,
    fontWeight: "800",
    color: "#102A35",
    letterSpacing: -0.4,
  },
  subHeading: {
    fontSize: 13,
    color: "#527986",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  formSection: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  inputWrapperFocused: {
    borderColor: "#1D7A78",
    backgroundColor: "#F4F8F7",
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#102A35",
    paddingVertical: 0,
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -2,
    marginBottom: 18,
  },
  forgotPasswordText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#1D7A78",
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D7A78",
    height: 48,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#1D7A78",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DCE8E5",
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 12,
    color: "#527986",
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE8E5",
    height: 48,
    borderRadius: 12,
    gap: 10,
    shadowColor: "rgba(18, 60, 74, 0.05)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#102A35",
  },
  bottomPromptRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  bottomPromptText: {
    fontSize: 13,
    color: "#527986",
  },
  bottomPromptLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1D7A78",
  },
  illustrationWrapper: {
    marginTop: 10,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
  },
  campusIllustration: {
    width: "100%",
    height: "100%",
  },
  illustrationImage: {
    opacity: 0.12,
    resizeMode: "cover",
  },
});

export default Login;
