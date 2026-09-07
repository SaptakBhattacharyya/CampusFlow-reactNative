import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, Image, ImageBackground, TouchableOpacity, Modal, Platform, StatusBar, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { createIssue } from "../../../services/api";
import { useAuth } from "@/context/AuthContext";

const categories = ["Electricity & Power", "Water & Plumbing", "Classroom & Furniture", "Internet & Wi-Fi", "Cleanliness & Waste", "Hostel Facilities", "Library & Labs", "Other Issues"];

const Report = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [categoryModal, setCategoryModal] = useState(false);
  const [photoModal, setPhotoModal] = useState(false);
  const [image, setImage] = useState(null);

  // Direct Live Position tracking via watchPositionAsync
  const [location, setLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startLocationWatcher = async () => {
    try {
      setIsLocating(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied");
        setIsLocating(false);
        return null;
      }

      // Initial fast fix
      try {
        const initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (initialLoc?.coords) {
          setLocation({
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
            accuracy: initialLoc.coords.accuracy,
          });
          setIsLocating(false);
        }
      } catch (initErr) {
        console.log("Initial position fetch error:", initErr);
      }

      // Continuous direct tracking via watchPositionAsync
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 2,
        },
        (newLoc) => {
          if (newLoc?.coords) {
            setLocation({
              latitude: newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
              accuracy: newLoc.coords.accuracy,
            });
            setIsLocating(false);
            setLocationError(null);
          }
        }
      );

      return subscription;
    } catch (error) {
      console.log("watchPositionAsync error:", error);
      setLocationError("Could not track GPS position");
      setIsLocating(false);
      return null;
    }
  };

  useEffect(() => {
    let sub = null;
    startLocationWatcher().then((subscription) => {
      sub = subscription;
    });

    return () => {
      if (sub && sub.remove) {
        sub.remove();
      }
    };
  }, []);

  const takePhoto = async () => {
    setPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Permission Required",
          "Please grant camera access to take photos of campus issues."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageString = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImage(imageString);
      }
    } catch (error) {
      console.log("Error taking photo:", error);
      Alert.alert("Camera Error", "Could not open camera. Please try again.");
    }
  };

  const pickImageFromGallery = async () => {
    setPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Gallery Permission Required",
          "Please grant gallery access to select photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageString = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setImage(imageString);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Gallery Error", "Could not select photo. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      return Alert.alert(
        "Required Field",
        "Please select an issue category."
      );
    }

    if (!title.trim()) {
      return Alert.alert(
        "Required Field",
        "Please enter an issue title."
      );
    }

    if (!venue.trim()) {
      return Alert.alert(
        "Required Field",
        "Please enter the issue venue (e.g. Room 204, Library, Hostel Block B)."
      );
    }

    if (!description.trim()) {
      return Alert.alert(
        "Required Field",
        "Please enter issue description."
      );
    }

    if (!location) {
      return Alert.alert(
        "GPS Required",
        "GPS coordinates are required to submit the report. Please enable GPS."
      );
    }

    try {
      setIsSubmitting(true);
      await createIssue(
        {
          title: title.trim(),
          description: description.trim(),
          category: category,
          priority: priority,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: venue.trim(),
          },
          image: image || "",
        },
        token
      );

      Alert.alert(
        "Issue Submitted",
        "Your issue has been reported successfully!",
        [
          {
            text: "OK",
            onPress: () => router.push("/issues"),
          },
        ]
      );

    } catch (error) {
      console.log("Submit Issue Error:", error);

      Alert.alert(
        "Error",
        error.message || "Could not submit the issue."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ================= PART 1: HEADER & TITLE ================= */}
        <ImageBackground source={require("@/assets/images/campus-bg-report.jpg")} style={styles.heroBg} imageStyle={{ opacity: 0.15 }}>
          <View style={styles.heroOverlay}>
            <View style={styles.rowBetween}>
              <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} style={styles.iconBtn}>
                <Ionicons name="menu-outline" size={26} color="#1E293B" />
              </TouchableOpacity>
              <Image source={require("@/assets/images/logo.png")} style={{ width: 160, height: 38 }} resizeMode="contain" />
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => router.push("/(drawer)/notifications")}
              >
                <Ionicons name="notifications-outline" size={24} color="#1E293B" />
                <View style={styles.badge} />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={styles.pageTitle}>Report an Issue</Text>
              <Text style={styles.pageSub}>Help improve our campus by reporting issues around you.</Text>
              <View style={styles.accentBar} />
            </View>
          </View>
        </ImageBackground>

        {/* ================= PART 2: FORM FIELDS ================= */}
        <View style={styles.formBody}>
          {/* Issue Category */}
          <View style={styles.card}>
            <Text style={styles.label}>Issue Category <Text style={{ color: "#DC2626" }}>*</Text></Text>
            <TouchableOpacity style={styles.inputBox} onPress={() => setCategoryModal(true)}>
              <View style={styles.iconBox}><Ionicons name="grid-outline" size={18} color="#2563EB" /></View>
              <Text style={[styles.flex1, { fontSize: 13, color: category ? "#0F172A" : "#94A3B8" }]}>{category || "Select issue category"}</Text>
              <Ionicons name="chevron-down" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Issue Title */}
          <View style={styles.card}>
            <Text style={styles.label}>Issue Title <Text style={{ color: "#DC2626" }}>*</Text></Text>
            <View style={styles.inputBox}>
              <View style={styles.iconBox}><Ionicons name="document-text-outline" size={18} color="#2563EB" /></View>
              <TextInput placeholder="e.g. Projector not working" placeholderTextColor="#94A3B8" value={title} onChangeText={setTitle} style={[styles.flex1, { fontSize: 13, color: "#0F172A" }]} />
            </View>
          </View>

          {/* Issue Venue & Direct watchPositionAsync Live Coordinates */}
          <View style={styles.card}>
            <Text style={styles.label}>Issue Venue / Location <Text style={{ color: "#DC2626" }}>*</Text></Text>
            <View style={styles.inputBox}>
              <View style={styles.iconBox}><Ionicons name="business-outline" size={18} color="#2563EB" /></View>
              <TextInput
                placeholder="e.g. Engineering Block Room 204, Hostel B"
                placeholderTextColor="#94A3B8"
                value={venue}
                onChangeText={setVenue}
                style={[styles.flex1, { fontSize: 13, color: "#0F172A" }]}
              />
            </View>

            {/* Direct GPS Coordinates Tracker */}
            <View style={[styles.gpsBox, location ? styles.gpsBoxActive : styles.gpsBoxPending]}>
              <View style={[styles.gpsIconDot, location ? styles.gpsDotActive : styles.gpsDotPending]}>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Ionicons
                    name={location ? "navigate" : "location-outline"}
                    size={14}
                    color={location ? "#16A34A" : "#EF4444"}
                  />
                )}
              </View>
              <View style={styles.flex1}>
                {isLocating ? (
                  <Text style={styles.gpsText}>Tracking live GPS position...</Text>
                ) : location ? (
                  <Text style={styles.gpsTextSuccess}>
                    Live GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                    {location.accuracy ? ` (±${Math.round(location.accuracy)}m)` : ""}
                  </Text>
                ) : (
                  <Text style={styles.gpsTextError}>
                    {locationError || "Waiting for GPS coordinates..."}
                  </Text>
                )}
              </View>
              {(!location || locationError) && (
                <TouchableOpacity onPress={startLocationWatcher} style={styles.retryGpsBtn}>
                  <Ionicons name="refresh" size={12} color="#2563EB" />
                  <Text style={styles.retryGpsText}>Retry</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <Text style={styles.label}>Describe the Issue <Text style={{ color: "#DC2626" }}>*</Text></Text>
            <View style={[styles.inputBox, { alignItems: "flex-start", minHeight: 90, paddingVertical: 10 }]}>
              <View style={[styles.iconBox, { marginTop: 2 }]}><Ionicons name="chatbox-ellipses-outline" size={18} color="#2563EB" /></View>
              <TextInput placeholder="Provide as much detail as possible..." placeholderTextColor="#94A3B8" value={description} onChangeText={setDescription} maxLength={500} multiline style={[styles.flex1, { fontSize: 13, color: "#0F172A", textAlignVertical: "top" }]} />
            </View>
            <Text style={{ fontSize: 11, color: "#94A3B8", textAlign: "right", marginTop: 4 }}>{description.length}/500</Text>
          </View>

          {/* Add Photo (Camera / Gallery) */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Photo of Issue (optional)</Text>
              {image && (
                <TouchableOpacity onPress={() => setImage(null)} style={styles.removePhotoBadge}>
                  <Ionicons name="trash-outline" size={13} color="#EF4444" />
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {image ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: image }} style={styles.imagePreview} resizeMode="cover" />
                <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhotoModal(true)} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={15} color="#FFF" />
                  <Text style={styles.retakeBtnText}>Retake / Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.inputBox} onPress={() => setPhotoModal(true)} activeOpacity={0.7}>
                <View style={styles.iconBox}><Ionicons name="camera" size={18} color="#2563EB" /></View>
                <View style={styles.flex1}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#0F172A" }}>Tap to take or attach photo</Text>
                  <Text style={{ fontSize: 11, color: "#527986", marginTop: 2 }}>Capture via Camera or pick from Gallery</Text>
                </View>
                <View style={styles.dashedBox}><Ionicons name="camera-outline" size={18} color="#1D7A78" /></View>
              </TouchableOpacity>
            )}
          </View>

          {/* Priority */}
          <View style={{ marginTop: 4 }}>
            <Text style={styles.label}>Priority <Text style={{ color: "#D94848" }}>*</Text></Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setPriority("Low")} style={[styles.pill, priority === "Low" ? styles.lowActive : styles.pillDefault]}>
                <Ionicons name="arrow-down-outline" size={16} color="#2EA885" /><Text style={{ color: "#2EA885", fontSize: 13, fontWeight: "700" }}>Low</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPriority("Medium")} style={[styles.pill, priority === "Medium" ? styles.mediumActive : styles.pillDefault]}>
                <Ionicons name="remove-circle-outline" size={16} color="#E07A28" /><Text style={{ color: "#E07A28", fontSize: 13, fontWeight: "700" }}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPriority("High")} style={[styles.pill, priority === "High" ? styles.highActive : styles.pillDefault]}>
                <Ionicons name="arrow-up-outline" size={16} color="#D94848" /><Text style={{ color: "#D94848", fontSize: 13, fontWeight: "700" }}>High</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={18} color="#FFF" />
                <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>Submit Issue</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={categoryModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.rowBetween}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#102A35" }}>Select Category</Text>
              <TouchableOpacity onPress={() => setCategoryModal(false)}><Ionicons name="close" size={24} color="#527986" /></TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              style={{ marginTop: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.modalItem, category === item && { backgroundColor: "#E8F5F4" }]} onPress={() => { setCategory(item); setCategoryModal(false); }}>
                  <Text style={{ fontSize: 14, color: category === item ? "#1D7A78" : "#102A35", fontWeight: category === item ? "700" : "500" }}>{item}</Text>
                  {category === item && <Ionicons name="checkmark" size={20} color="#1D7A78" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Photo Picker Modal */}
      <Modal visible={photoModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.rowBetween}>
              <Text style={{ fontSize: 17, fontWeight: "700", color: "#102A35" }}>Add Photo</Text>
              <TouchableOpacity onPress={() => setPhotoModal(false)}>
                <Ionicons name="close" size={24} color="#527986" />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: "#527986", marginTop: 4, marginBottom: 16 }}>
              Select how you want to attach a photo for this report:
            </Text>

            <TouchableOpacity style={styles.photoOptionBtn} onPress={takePhoto} activeOpacity={0.7}>
              <View style={[styles.photoOptionIcon, { backgroundColor: "#E8F5F4" }]}>
                <Ionicons name="camera" size={22} color="#1D7A78" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.photoOptionTitle}>Take Photo (Camera)</Text>
                <Text style={styles.photoOptionSub}>Use your device camera to capture the issue</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7B9AA5" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.photoOptionBtn, { marginTop: 10 }]} onPress={pickImageFromGallery} activeOpacity={0.7}>
              <View style={[styles.photoOptionIcon, { backgroundColor: "#E8F8F4" }]}>
                <Ionicons name="images" size={22} color="#55C6A9" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.photoOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.photoOptionSub}>Select an existing image from your photo library</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#7B9AA5" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8F7" },
  heroBg: { width: "100%", paddingTop: 8 },
  heroOverlay: { paddingHorizontal: 16, paddingBottom: 16 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flex1: { flex: 1 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.9)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#DCE8E5" },
  badge: { position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: 4, backgroundColor: "#D94848" },
  pageTitle: { fontSize: 24, fontWeight: "800", color: "#102A35" },
  pageSub: { fontSize: 13, color: "#527986", marginTop: 4 },
  accentBar: { width: 36, height: 3, backgroundColor: "#55C6A9", borderRadius: 2, marginTop: 8 },
  formBody: { paddingHorizontal: 16, marginTop: 14, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "#DCE8E5", elevation: 1 },
  label: { fontSize: 13, fontWeight: "700", color: "#102A35", marginBottom: 8 },
  inputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#F4F8F7", borderRadius: 12, paddingHorizontal: 10, minHeight: 48, borderWidth: 1, borderColor: "#DCE8E5" },
  iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#E8F5F4", justifyContent: "center", alignItems: "center", marginRight: 10 },
  dashedBox: { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, borderColor: "#55C6A9", borderStyle: "dashed", justifyContent: "center", alignItems: "center", backgroundColor: "#E8F8F4" },
  gpsBox: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, gap: 8 },
  gpsBoxActive: { backgroundColor: "#E8F8F4", borderColor: "#55C6A9" },
  gpsBoxPending: { backgroundColor: "#F4F8F7", borderColor: "#DCE8E5" },
  gpsIconDot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  gpsDotActive: { backgroundColor: "#55C6A9" },
  gpsDotPending: { backgroundColor: "#E8F5F4" },
  gpsText: { fontSize: 11, color: "#527986", fontWeight: "500" },
  gpsTextSuccess: { fontSize: 11.5, color: "#1D7A78", fontWeight: "700" },
  gpsTextError: { fontSize: 11, color: "#D94848", fontWeight: "500" },
  retryGpsBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5F4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 3 },
  retryGpsText: { fontSize: 11, color: "#1D7A78", fontWeight: "600" },
  imagePreviewWrapper: { borderRadius: 12, overflow: "hidden", marginTop: 4, position: "relative", backgroundColor: "#102A35" },
  imagePreview: { width: "100%", height: 180, borderRadius: 12 },
  retakeBtn: { position: "absolute", bottom: 10, right: 10, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(18, 60, 74, 0.88)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  retakeBtnText: { color: "#FFF", fontSize: 12, fontWeight: "700" },
  removePhotoBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: "#FDF0F0", marginBottom: 6 },
  removePhotoText: { fontSize: 11, fontWeight: "700", color: "#D94848" },
  photoOptionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#F4F8F7", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#DCE8E5" },
  photoOptionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  photoOptionTitle: { fontSize: 14, fontWeight: "700", color: "#102A35" },
  photoOptionSub: { fontSize: 11, color: "#527986", marginTop: 2 },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, gap: 6, borderWidth: 1 },
  pillDefault: { backgroundColor: "#FFF", borderColor: "#DCE8E5" },
  lowActive: { backgroundColor: "#E8F8F4", borderColor: "#55C6A9" },
  mediumActive: { backgroundColor: "#FFF5EC", borderColor: "#FED7AA" },
  highActive: { backgroundColor: "#FDF0F0", borderColor: "#FECACA" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1D7A78", paddingVertical: 14, borderRadius: 16, gap: 8, marginTop: 10, elevation: 3 },
  modalBg: { flex: 1, backgroundColor: "rgba(18,60,74,0.45)", justifyContent: "flex-end" },
  modalBox: { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "60%" },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#F4F8F7" },
});

export default Report;