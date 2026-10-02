import React, { useState, useEffect } from "react";
import { db } from "../../../components/Firebase";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { 
  Video, 
  Sparkles, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Tv, 
  Volume2, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw,
  Layers,
  Megaphone,
  Heading,
  CheckCircle2,
  FileVideo,
  Play
} from "lucide-react";
import axios from "axios";

// Helper to upload media (images or videos) to Cloudinary reading from environment variables
const uploadMediaToCloudinary = async (file, resourceType = "auto") => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const assetFolder = import.meta.env.VITE_CLOUDINARY_ASSET_FOLDER;

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  data.append("folder", assetFolder);

  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    data
  );

  return res.data.secure_url;
};

const DEFAULT_SETTINGS = {
  heroVideoUrl: "https://res.cloudinary.com/dcjn4y284/video/upload/v1789826708/95d3be6fd9d84a7ea956b74d39f59fa1_n0gsf0.mp4",
  heroTitle: "Pure Vedic Nutrition",
  heroSubtitle: "Stone-Ground • Sun-Dried • 100% Organic Sattu",
  heroButtonText: "Explore Collection",
  heroButtonLink: "/shop",
  tickerEnabled: true,
  tickerSpeed: 35,
  tickerMessages: [
    "100% Certified Organic Foods",
    "Stone-Ground · Sun-Dried · Pure Heritage Nutrition",
    "Premium Roasted Sattu & Organic Staples",
    "Free Express Shipping Above ₹999"
  ],
  testimonialsMobileBg: "https://res.cloudinary.com/dcjn4y284/image/upload/v1789828465/Vedamya_Foods.jpg_1_polacf.jpg",
  testimonialsDesktopBg: "https://res.cloudinary.com/duzwys877/image/upload/v1782294871/b2_o8oxcn.png",
};

const HomepageManager = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // File upload state & progress
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingMobileBg, setUploadingMobileBg] = useState(false);
  const [uploadingDesktopBg, setUploadingDesktopBg] = useState(false);

  const [newTickerText, setNewTickerText] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const docRef = doc(db, "settings", "homepage");
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...DEFAULT_SETTINGS, ...docSnap.data() }));
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching homepage settings:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, "settings", "homepage");
      await setDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      }, { merge: true });
      triggerToast("✓ Homepage settings updated & published live!");
    } catch (err) {
      console.error("Error saving homepage settings:", err);
      triggerToast("Error publishing settings. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const url = await uploadMediaToCloudinary(file, "video");
      setSettings((prev) => ({ ...prev, heroVideoUrl: url }));
      triggerToast("Hero video uploaded successfully!");
    } catch (err) {
      console.error("Video upload failed:", err);
      triggerToast("Failed to upload video. Please paste direct Cloudinary URL.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleImageUpload = async (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    if (key === "testimonialsMobileBg") setUploadingMobileBg(true);
    if (key === "testimonialsDesktopBg") setUploadingDesktopBg(true);

    try {
      const url = await uploadMediaToCloudinary(file, "image");
      setSettings((prev) => ({ ...prev, [key]: url }));
      triggerToast("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload failed:", err);
      triggerToast("Failed to upload image. Please paste direct image URL.");
    } finally {
      setUploadingMobileBg(false);
      setUploadingDesktopBg(false);
    }
  };

  const handleAddTicker = () => {
    if (!newTickerText.trim()) return;
    setSettings((prev) => ({
      ...prev,
      tickerMessages: [...(prev.tickerMessages || []), newTickerText.trim()]
    }));
    setNewTickerText("");
  };

  const handleRemoveTicker = (index) => {
    setSettings((prev) => ({
      ...prev,
      tickerMessages: prev.tickerMessages.filter((_, i) => i !== index)
    }));
  };

  const handleTickerChange = (index, value) => {
    setSettings((prev) => {
      const updated = [...(prev.tickerMessages || [])];
      updated[index] = value;
      return { ...prev, tickerMessages: updated };
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A69280]">
        <div className="w-12 h-12 border-4 border-[#D9A036]/20 border-t-[#D9A036] rounded-full animate-spin mx-auto mb-4" />
        <p className="font-bold text-sm uppercase tracking-wider">Loading Homepage Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1A110B] via-[#2A1B12] to-[#1A110B] p-6 sm:p-8 rounded-3xl border border-[#3E2B1E] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 bg-[#D9A036]/15 border border-[#D9A036]/30 px-3 py-1 rounded-full text-xs font-black uppercase text-[#D9A036] tracking-wider">
            <Sparkles size={14} />
            <span>Real-time Content Controller</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Homepage Content Manager
          </h1>
          <p className="text-xs sm:text-sm text-[#A69280] font-semibold max-w-xl">
            Customize the Hero video, top scrolling announcement ticker, background images, and homepage banners live across all devices.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="z-10 px-6 py-4 bg-gradient-to-r from-[#D9A036] to-[#B8860B] hover:from-[#E6B04A] hover:to-[#C9961A] text-[#140D08] font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-95 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              <span>Publishing...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save & Publish Live</span>
            </>
          )}
        </button>
      </div>

      {/* Main Settings Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: HERO VIDEO & TICKER */}
        <div className="lg:col-span-7 space-y-8">

          {/* 1. HERO VIDEO SETTINGS */}
          <div className="bg-[#1A110B] border border-[#3E2B1E] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#3E2B1E]">
              <div className="w-11 h-11 rounded-2xl bg-[#D9A036]/15 text-[#D9A036] border border-[#D9A036]/30 flex items-center justify-center">
                <Video size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Hero Video & Media Settings
                </h3>
                <p className="text-xs text-[#A69280] font-semibold">Change main video stream running on the homepage background</p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#D9A036] flex items-center justify-between">
                <span>Active Hero Video Preview</span>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                  <Play size={10} fill="currentColor" /> Live Stream
                </span>
              </label>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[#3E2B1E] shadow-inner group">
                {settings.heroVideoUrl ? (
                  <video
                    key={settings.heroVideoUrl}
                    src={settings.heroVideoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#A69280] gap-2">
                    <FileVideo size={36} />
                    <p className="text-xs font-bold">No Hero Video Configured</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Input & Upload Button */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-[#A69280]">
                Hero Video Stream URL (Cloudinary / MP4 URL)
              </label>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  value={settings.heroVideoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
                  placeholder="https://res.cloudinary.com/.../video.mp4"
                  className="flex-1 bg-[#140D08] border border-[#3E2B1E] focus:border-[#D9A036] outline-none text-white px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold shadow-inner"
                />

                <label className="px-5 py-3.5 bg-[#2A1B12] hover:bg-[#3E2B1E] border border-[#3E2B1E] hover:border-[#D9A036] text-[#D9A036] text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0">
                  {uploadingVideo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#D9A036]/20 border-t-[#D9A036] rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      <span>Upload Video</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[11px] text-[#A69280]/70 font-medium">
                Tip: Direct Cloudinary MP4 links provide zero-buffering high-speed streaming.
              </p>
            </div>
          </div>

          {/* 2. TOP HEADER ANNOUNCEMENT TICKER */}
          <div className="bg-[#1A110B] border border-[#3E2B1E] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#3E2B1E]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#D9A036]/15 text-[#D9A036] border border-[#D9A036]/30 flex items-center justify-center">
                  <Megaphone size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-wide">
                    Top Header Announcement Ticker
                  </h3>
                  <p className="text-xs text-[#A69280] font-semibold">Manage live scrolling messages at top of header</p>
                </div>
              </div>

              {/* Ticker Enabled Toggle */}
              <label className="flex items-center gap-2 cursor-pointer bg-[#140D08] px-3.5 py-2 rounded-xl border border-[#3E2B1E]">
                <input
                  type="checkbox"
                  checked={settings.tickerEnabled !== false}
                  onChange={(e) => setSettings({ ...settings, tickerEnabled: e.target.checked })}
                  className="rounded text-[#D9A036] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-black uppercase text-[#D9A036]">Enabled</span>
              </label>
            </div>

            {/* Existing Ticker Messages */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-[#D9A036] flex items-center justify-between">
                <span>Active Scrolling Ticker Lines</span>
                <span className="text-[11px] text-[#A69280] font-normal">
                  {settings.tickerMessages?.length || 0} messages
                </span>
              </label>

              <div className="space-y-2.5">
                {(settings.tickerMessages || []).map((msg, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#2A1B12] text-[#D9A036] font-black text-xs flex items-center justify-center shrink-0 border border-[#3E2B1E]">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={msg}
                      onChange={(e) => handleTickerChange(index, e.target.value)}
                      className="flex-1 bg-[#140D08] border border-[#3E2B1E] focus:border-[#D9A036] outline-none text-white px-4 py-3 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTicker(index)}
                      className="p-2.5 rounded-xl bg-red-900/30 hover:bg-red-900/60 text-rose-400 border border-red-800/40 transition-colors cursor-pointer"
                      title="Delete ticker line"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Ticker Input */}
            <div className="pt-2 border-t border-[#3E2B1E] space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#A69280]">
                Add New Announcement Line
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTickerText}
                  onChange={(e) => setNewTickerText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTicker(); } }}
                  placeholder="e.g. Free Shipping on orders above ₹499"
                  className="flex-1 bg-[#140D08] border border-[#3E2B1E] focus:border-[#D9A036] outline-none text-white px-4 py-3 rounded-xl text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddTicker}
                  className="px-4 py-3 bg-[#D9A036]/20 hover:bg-[#D9A036]/35 text-[#D9A036] border border-[#D9A036]/40 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Add Line</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TESTIMONIALS BACKGROUNDS & PROMO BANNERS */}
        <div className="lg:col-span-5 space-y-8">

          {/* 3. TESTIMONIALS BACKGROUND ASSETS */}
          <div className="bg-[#1A110B] border border-[#3E2B1E] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#3E2B1E]">
              <div className="w-11 h-11 rounded-2xl bg-[#D9A036]/15 text-[#D9A036] border border-[#D9A036]/30 flex items-center justify-center">
                <ImageIcon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Testimonials Background Assets
                </h3>
                <p className="text-xs text-[#A69280] font-semibold">Configure mobile & desktop background scenery images</p>
              </div>
            </div>

            {/* Mobile Background Image */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-[#D9A036]">
                Mobile Background Image (Screens &lt; 768px)
              </label>
              <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-black border border-[#3E2B1E] group">
                <img
                  src={settings.testimonialsMobileBg}
                  alt="Mobile Background"
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x150?text=Mobile+Bg"; }}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.testimonialsMobileBg || ""}
                  onChange={(e) => setSettings({ ...settings, testimonialsMobileBg: e.target.value })}
                  placeholder="https://res.cloudinary.com/.../mobile.jpg"
                  className="flex-1 bg-[#140D08] border border-[#3E2B1E] focus:border-[#D9A036] outline-none text-white px-3.5 py-3 rounded-xl text-xs font-semibold"
                />
                <label className="px-3.5 py-3 bg-[#2A1B12] hover:bg-[#3E2B1E] border border-[#3E2B1E] hover:border-[#D9A036] text-[#D9A036] text-xs font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0">
                  {uploadingMobileBg ? (
                    <div className="w-4 h-4 border-2 border-[#D9A036]/20 border-t-[#D9A036] rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "testimonialsMobileBg")}
                    disabled={uploadingMobileBg}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Desktop Background Image */}
            <div className="space-y-3 pt-3 border-t border-[#3E2B1E]">
              <label className="text-xs font-black uppercase tracking-wider text-[#D9A036]">
                Desktop Background Image (Screens &ge; 768px)
              </label>
              <div className="relative h-28 w-full rounded-2xl overflow-hidden bg-black border border-[#3E2B1E] group">
                <img
                  src={settings.testimonialsDesktopBg}
                  alt="Desktop Background"
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x150?text=Desktop+Bg"; }}
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={settings.testimonialsDesktopBg || ""}
                  onChange={(e) => setSettings({ ...settings, testimonialsDesktopBg: e.target.value })}
                  placeholder="https://res.cloudinary.com/.../desktop.png"
                  className="flex-1 bg-[#140D08] border border-[#3E2B1E] focus:border-[#D9A036] outline-none text-white px-3.5 py-3 rounded-xl text-xs font-semibold"
                />
                <label className="px-3.5 py-3 bg-[#2A1B12] hover:bg-[#3E2B1E] border border-[#3E2B1E] hover:border-[#D9A036] text-[#D9A036] text-xs font-black uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0">
                  {uploadingDesktopBg ? (
                    <div className="w-4 h-4 border-2 border-[#D9A036]/20 border-t-[#D9A036] rounded-full animate-spin" />
                  ) : (
                    <Upload size={14} />
                  )}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "testimonialsDesktopBg")}
                    disabled={uploadingDesktopBg}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-gradient-to-r from-[#2A1B12] to-[#1A110B] border border-[#3E2B1E] rounded-3xl p-6 shadow-xl space-y-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#D9A036] mx-auto" />
            <h4 className="text-base font-black text-white uppercase tracking-wide">
              Live Real-Time Sync
            </h4>
            <p className="text-xs text-[#A69280] font-medium leading-relaxed">
              All changes saved here immediately update the website without requiring server restarts or code redeployments.
            </p>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#D9A036] to-[#B8860B] hover:from-[#E6B04A] hover:to-[#C9961A] text-[#140D08] font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all border border-white/20 cursor-pointer"
            >
              {saving ? "Publishing Settings..." : "Publish All Changes Now"}
            </button>
          </div>

        </div>
      </form>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 bg-[#D9A036] text-[#140D08] font-black px-6 py-4 rounded-2xl shadow-2xl border border-white/40 flex items-center gap-3 text-xs sm:text-sm uppercase tracking-wider animate-bounce">
          <Sparkles size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default HomepageManager;
