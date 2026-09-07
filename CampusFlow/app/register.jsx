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

const Register = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const { signInWithGoogle, isGoogleLoading } = useGoogleAuth();

  // Form states
  const [selectedRole, setSelectedRole] = useState("User");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [university, setUniversity] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [year, setYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active input highlight
  const [focusedInput, setFocusedInput] = useState(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !university.trim() || !password) {
      Alert.alert("Required Fields", "Please fill in your name, email, university/college, and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (!agreeTerms) {
      Alert.alert("Terms & Conditions", "Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        phone: phone.trim(),
        department: department.trim(),
        university: university.trim(),
        rollNumber: rollNumber.trim(),
        year: year.trim(),
      });

      Alert.alert(
        "Registration Successful",
        `Welcome to CampusFlow, ${fullName.trim()}! Your profile has been created as ${selectedRole === "User" ? "General User" : selectedRole}.`,
        [{ text: "Go to Profile", onPress: () => router.replace("/(drawer)/(tabs)/profile") }]
      );
    } catch (error) {
      Alert.alert("Registration Failed", error.message || "Could not register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = () => {
    signInWithGoogle(selectedRole);
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
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/login"))}
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
              <Text style={styles.mainHeading}>Create an Account</Text>
              <Text style={styles.subHeading}>
                Join CampusFlow and help make our campus better
              </Text>
            </View>

            {/* ================= FORM INPUTS ================= */}
            <View style={styles.formSection}>
              {/* Role Selector */}
              <RoleSelector
                selectedRole={selectedRole}
                onSelectRole={setSelectedRole}
                title="Register As"
              />

              {/* Full Name */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "fullName" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={focusedInput === "fullName" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Full Name *"
                  placeholderTextColor="#7B9AA5"
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedInput("fullName")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

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
                  placeholder="Email Address *"
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

              {/* College / University Name */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "university" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={19}
                  color={focusedInput === "university" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="University / College Name *"
                  placeholderTextColor="#7B9AA5"
                  value={university}
                  onChangeText={setUniversity}
                  onFocus={() => setFocusedInput("university")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

              {/* Department */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "department" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={19}
                  color={focusedInput === "department" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Department / Branch (e.g. CSE)"
                  placeholderTextColor="#7B9AA5"
                  value={department}
                  onChangeText={setDepartment}
                  onFocus={() => setFocusedInput("department")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

              {/* Phone Number */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "phone" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={focusedInput === "phone" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Phone Number"
                  placeholderTextColor="#7B9AA5"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput("phone")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

              {/* Roll Number */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "rollNumber" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="id-card-outline"
                  size={19}
                  color={focusedInput === "rollNumber" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Roll Number (e.g. 22052004)"
                  placeholderTextColor="#7B9AA5"
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  onFocus={() => setFocusedInput("rollNumber")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
              </View>

              {/* Academic Year */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "year" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={19}
                  color={focusedInput === "year" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Academic Year (e.g. 3rd Year)"
                  placeholderTextColor="#7B9AA5"
                  value={year}
                  onChangeText={setYear}
                  onFocus={() => setFocusedInput("year")}
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
                  placeholder="Password *"
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

              {/* Confirm Password */}
              <View
                style={[
                  styles.inputWrapper,
                  focusedInput === "confirmPassword" && styles.inputWrapperFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={focusedInput === "confirmPassword" ? "#55C6A9" : "#7B9AA5"}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm Password *"
                  placeholderTextColor="#7B9AA5"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#7B9AA5"
                  />
                </TouchableOpacity>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAgreeTerms(!agreeTerms)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                  {agreeTerms && <Ionicons name="checkmark" size={13} color="#FFF" />}
                </View>
                <Text style={styles.checkboxText}>
                  I agree to the{" "}
                  <Text
                    style={styles.inlineLink}
                    onPress={() => Alert.alert("Terms of Service", "CampusFlow Terms of Service")}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={styles.inlineLink}
                    onPress={() => Alert.alert("Privacy Policy", "CampusFlow Privacy Policy")}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={19} color="#FFF" />
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Sign Up Button */}
              <TouchableOpacity
                style={[styles.googleButton, isGoogleLoading && { opacity: 0.7 }]}
                onPress={handleGoogleSignUp}
                disabled={isGoogleLoading}
                activeOpacity={0.85}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#1D7A78" size="small" />
                ) : (
                  <>
                    <AntDesign name="google" size={18} color="#EA4335" />
                    <Text style={styles.googleButtonText}>Sign Up with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Login Navigation Prompt */}
              <View style={styles.bottomPromptRow}>
                <Text style={styles.bottomPromptText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push("/login")} activeOpacity={0.7}>
                  <Text style={styles.bottomPromptLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 36,
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
    marginBottom: 20,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 18,
    gap: 8,
  },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#DCE8E5",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#1D7A78",
    borderColor: "#1D7A78",
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: "#527986",
    lineHeight: 16,
  },
  inlineLink: {
    color: "#1D7A78",
    fontWeight: "600",
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
});

export default Register;
