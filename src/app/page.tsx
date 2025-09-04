"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Home, User, Package, Camera, Heart, DollarSign, Upload, MessageSquare, LogIn, LogOut, Share, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useSession, signIn, signOut } from 'next-auth/react'

function LabeledInput({ label, className, ...props }: {label: string} & React.ComponentProps<typeof Input>) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <Input data-slot="labeled-input" className="w-full" {...props} />
    </div>
  );
}

function EngagementActions({
  liked,
  likes,
  onLike,
  onTip,
  onShare,
  onComment,
}: {
  liked: boolean;
  likes: number;
  onLike: () => void;
  onTip: () => void;
  onShare: () => void;
  onComment?: () => void;
}) {
  return (
    <div className="flex gap-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex items-center gap-2 ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
        onClick={onLike}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        <span>{Number.isFinite(likes as unknown as number) ? likes : 0}</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 text-muted-foreground hover:text-purple-500"
        onClick={() => onComment?.()}
        aria-label="Comments"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 text-muted-foreground hover:text-green-500"
        onClick={onTip}
      >
        <DollarSign className="h-4 w-4" />
        <span>Tip</span>
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className="flex items-center gap-2 text-muted-foreground hover:text-blue-500"
        onClick={onShare}
      >
        <Share className="h-4 w-4" />
        <span>Share</span>
      </Button>
    </div>
  );
}

type Screen = "home" | "profile" | "services" | "photo" | "upload" | "login" | "signup" | "messages" | "tip" | "share" | "serviceDetail" | "photoFull" | "book" | "editProfile" | "settings" | "comments" | "tipHistory";

export default function MobileApp() {
  const [userRole, setUserRole] = useState<"creator" | "general">("creator");
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const { data: session, status } = useSession();
  const isLoggedIn = !!session?.user;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // profile editable state
  const [profileName, setProfileName] = useState<string>("Sarah Artist");
  const [profileHandle, setProfileHandle] = useState<string>("@sarahartist");
  const [profileBio, setProfileBio] = useState<string>("");
    // navigation context for feature screens
    const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
    const [selectedPhotoPost, setSelectedPhotoPost] = useState<any | null>(null);
        const [uploadedPosts, setUploadedPosts] = useState<any[]>([]);
    const [selectedService, setSelectedService] = useState<{ name: string; price: string; description: string } | null>(null);
    const [prevScreen, setPrevScreen] = useState<Screen>("home");

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both email and password");
      return;
    }
    const res = await signIn('credentials', { email: username, password, redirect: false });
    if (res?.error) {
      alert('Invalid credentials');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleSignup = async () => {
    if (!email || !username || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const r = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: username })
    });
    if (!r.ok) {
      const data = await r.json().catch(() => ({ error: 'Signup failed' }));
      alert(data.error || 'Signup failed');
      return;
    }
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res?.error) {
      alert('Sign-in failed');
      return;
    }
    setCurrentScreen('home');
    alert('Account created successfully! Welcome! 🎉');
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setUsername("");
    setPassword("");
    setEmail("");
    setConfirmPassword("");
    setCurrentScreen("login");
  };

  // If not logged in, show login screen
  if (!isLoggedIn) {
    if (currentScreen === "signup") {
      return <SignupScreen 
        onSignup={handleSignup} 
        onSwitchToLogin={() => setCurrentScreen("login")}
        email={email} 
        setEmail={setEmail}
        username={username} 
        setUsername={setUsername} 
        password={password} 
        setPassword={setPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
      />;
    }
    return <LoginScreen 
      onLogin={handleLogin} 
      onSwitchToSignup={() => setCurrentScreen("signup")}
      username={username} 
      setUsername={setUsername} 
      password={password} 
      setPassword={setPassword} 
    />;
  }

  // Navigation helpers
    const openMessages = () => { setPrevScreen(currentScreen); setCurrentScreen("messages"); };
    const openTip = (postId: number) => { setSelectedPostId(postId); setPrevScreen(currentScreen); setCurrentScreen("tip"); };
    const openShare = (postId: number) => { setSelectedPostId(postId); setPrevScreen(currentScreen); setCurrentScreen("share"); };
    const openComments = (post: any) => { setSelectedPhotoPost(post); setPrevScreen(currentScreen); setCurrentScreen("comments"); };
    const openServiceDetail = (service: { name: string; price: string; description: string }) => { setSelectedService(service); setCurrentScreen("serviceDetail"); };
    const openBooking = () => { setCurrentScreen("book"); };
    const openEditProfile = () => { setCurrentScreen("editProfile"); };
    const openPhotoFull = (post: any) => { setSelectedPhotoPost(post); setCurrentScreen("photoFull"); };

    const renderScreen = () => {
      if (currentScreen === "messages") return <MessagesScreen onBack={() => setCurrentScreen(prevScreen)} />;
      if (currentScreen === "tip") return <TipScreen postId={selectedPostId} onBack={() => setCurrentScreen(prevScreen)} />;
      if (currentScreen === "share") return <ShareScreen postId={selectedPostId} onBack={() => setCurrentScreen(prevScreen)} />;
      if (currentScreen === "serviceDetail") return <ServiceDetailScreen service={selectedService} onBack={() => setCurrentScreen("services")} onBook={openBooking} />;
      if (currentScreen === "photoFull") return <PhotoFullScreen post={selectedPhotoPost} onBack={() => setCurrentScreen("photo")} />;
      if (currentScreen === "settings") return (
        <SettingsScreen
          onBack={() => setCurrentScreen(prevScreen)}
          onEditProfile={() => setCurrentScreen("editProfile")}
          onMessages={() => { setPrevScreen("settings"); setCurrentScreen("messages"); }}
          onLogout={handleLogout}
          userRole={userRole}
          setUserRole={setUserRole}
        />
      );
      if (currentScreen === "comments") return <CommentsScreen post={selectedPhotoPost} onBack={() => setCurrentScreen(prevScreen)} onAddComment={(c)=>{/* no-op stub set in component */}} />;
      if (currentScreen === "tipHistory") return <TipHistoryScreen onBack={() => setCurrentScreen("profile")} />;
    switch (currentScreen) {
      case "home":
        return <HomeScreen onTip={openTip} onShare={openShare} onOpenProfile={() => setCurrentScreen("profile")} onOpenComments={(post)=>{ setSelectedPhotoPost(post); setPrevScreen("home"); setCurrentScreen("comments"); }} />;
      case "profile":
        return <ProfileScreen onMessages={openMessages} onOpenSculptorFeed={() => setCurrentScreen("photo")} onEditProfile={openEditProfile} onOpenSettings={() => setCurrentScreen("settings")} profileName={profileName} profileHandle={profileHandle} profileBio={profileBio} isCreator={userRole === 'creator'} onOpenTipHistory={() => setCurrentScreen('tipHistory')} />;
      case "services":
        return <ServicesScreen onServiceClick={openServiceDetail} />;
      case "photo":
        return (
          <PhotoScreen
            uploadedPosts={uploadedPosts}
            onImageClick={openPhotoFull}
            onTip={openTip}
            onShare={openShare}
            onOpenProfile={() => setCurrentScreen("profile")}
            onUpdatePost={(id, patch) => {
              setUploadedPosts(prev => prev.map(p => p.id === id ? { ...p, ...patch, timeAgo: p.timeAgo } : p));
            }}
            onDeletePost={(id) => {
              setUploadedPosts(prev => prev.filter(p => p.id !== id));
            }}
            onComment={(post)=>{ setSelectedPhotoPost(post); setPrevScreen("photo"); setCurrentScreen("comments"); }}
          />
        );
      case "upload":
        return (
          <UploadScreen
            onUpload={(data:any)=>{
              const post = {
                id: Date.now(),
                isUploaded: true,
                sculptorName: profileName || "You",
                username: profileHandle || "@you",
                timeAgo: "just now",
                imageTitle: data.title,
                description: data.description || data.story || "",
                stoneType: data.stoneType,
                story: data.story,
                tags: data.tags || [],
                phone: "+263 77 123 4567",
              };
              setUploadedPosts(prev=>[post, ...prev]);
              setCurrentScreen("photo");
            }}
          />
        );
      case "book":
        return <BookingFormScreen service={selectedService} onBack={() => setCurrentScreen("serviceDetail")} />;
      case "editProfile":
        return (
          <EditProfileScreen
            onBack={() => setCurrentScreen("profile")}
            name={profileName}
            handle={profileHandle}
            bio={profileBio}
            setName={setProfileName}
            setHandle={setProfileHandle}
            setBio={setProfileBio}
          />
        );
      default:
        return <HomeScreen onTip={openTip} onShare={openShare} onOpenProfile={() => setCurrentScreen("profile")} onOpenComments={(post)=>{ setSelectedPhotoPost(post); setPrevScreen("home"); setCurrentScreen("comments"); }} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background hide-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center p-4">
        <div />
        <div className="flex items-center gap-2">
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth-touch">
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t bg-background shadow-lg">
        <div className="flex justify-around py-2">
          <Button
            variant={currentScreen === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("home")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant={currentScreen === "profile" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("profile")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profile</span>
          </Button>
          {userRole === "creator" && (
            <Button
              variant={currentScreen === "upload" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentScreen("upload")}
              className="flex flex-col items-center gap-1 h-auto py-2 px-3"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload</span>
            </Button>
          )}
          <Button
            variant={currentScreen === "services" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("services")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">Services</span>
          </Button>
          <Button
            variant={currentScreen === "photo" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentScreen("photo")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">Photo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Upload Screen Component
function UploadScreen({ onUpload }: { onUpload: (data: { title: string; stoneType: string; story: string; tags: string[]; description?: string; fileName?: string; }) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [stoneType, setStoneType] = useState("");
    const [story, setStory] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }
    if (!title.trim() || !stoneType.trim() || !story.trim()) {
      alert("Please fill in Title, Stone Type, and Story");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      onUpload({ title, stoneType, story, tags, description, fileName: selectedFile?.name });
      setIsUploading(false);
      alert("Upload successful! 🎉");
      setSelectedFile(null);
      setDescription("");
      setTags([]);
      setCurrentTag("");
      setTitle("");
      setStoneType("");
      setStory("");
    }, 800);
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Upload</h1>
      
      {/* File Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="border-2 border-dashed border-border rounded-lg p-8 mb-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground mb-2">
                {selectedFile ? selectedFile.name : "Choose a file or drag and drop"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                PNG, JPG, GIF up to 10MB
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Title, Stone Type, Story */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <LabeledInput label="Title" type="text" placeholder="Give your post a title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <LabeledInput label="Stone Type" type="text" placeholder="e.g., Marble, Granite..." value={stoneType} onChange={(e)=>setStoneType(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Story behind the Sculptor</label>
            <Textarea rows={4} placeholder="Tell the story behind this piece..." value={story} onChange={(e)=>setStory(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Optional Description */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Description (optional)
          </label>
          <Textarea
            placeholder="Any extra details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardContent className="p-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add a tag..."
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1"
            />
            <Button onClick={handleAddTag} variant="outline" size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upload Button */}
      <Button 
        onClick={handleUpload} 
        className="w-full" 
        disabled={!selectedFile || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload Post"}
      </Button>
    </div>
  );
}

// Login Screen Component
function LoginScreen({ onLogin, onSwitchToSignup, username, setUsername, password, setPassword }: {
  onLogin: () => void;
  onSwitchToSignup: () => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}) {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background hide-scrollbar">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-2">Sign in to your account</p>
            </div>

            <div className="space-y-4">
              <LabeledInput
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <LabeledInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button onClick={onLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button 
                    onClick={onSwitchToSignup}
                    className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Signup Screen Component
function SignupScreen({ onSignup, onSwitchToLogin, email, setEmail, username, setUsername, password, setPassword, confirmPassword, setConfirmPassword }: {
  onSignup: () => void;
  onSwitchToLogin: () => void;
  email: string;
  setEmail: (value: string) => void;
  username: string;
  setUsername: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
}) {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-background hide-scrollbar">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-sm text-muted-foreground mt-2">Join our creative community</p>
            </div>

            <div className="space-y-4">
              <LabeledInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <LabeledInput
                label="Username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <LabeledInput
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <LabeledInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button onClick={onSignup} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Create Account
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button 
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Profile Screen Component
function ProfileScreen({ onMessages, onOpenSculptorFeed, onEditProfile, onOpenSettings, profileName, profileHandle, profileBio, isCreator, onOpenTipHistory }: { onMessages: () => void; onOpenSculptorFeed: () => void; onEditProfile: () => void; onOpenSettings: () => void; profileName: string; profileHandle: string; profileBio: string; isCreator: boolean; onOpenTipHistory: () => void; }) {
  const handlePostClick = (postIndex: number) => {
    // Open sculptor feed when tapping a profile post
    onOpenSculptorFeed();
  };

  const handleMessagesClick = () => {
    onMessages();
  };

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <Avatar className="h-20 w-20 mx-auto mb-3">
          <AvatarFallback className="text-2xl">SA</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold text-foreground">{profileName}</h1>
        <p className="text-muted-foreground">{profileHandle}</p>
        {profileBio ? (<p className="text-sm text-muted-foreground mt-1">{profileBio}</p>) : null}
        
        {/* Action Buttons */}
        <div className="flex gap-2 justify-center mt-3">
          {isCreator && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onOpenTipHistory}
              className="flex items-center gap-2"
            >
              Tip History
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMessagesClick}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Messages
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEditProfile}
            className="flex items-center gap-2"
          >
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Settings"
            onClick={onOpenSettings}
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex justify-around text-center">
            <div>
              <p className="font-bold text-xl text-foreground">42</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-xl text-foreground">1.2K</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-xl text-foreground">856</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-square bg-gradient-to-br from-muted to-muted/80 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handlePostClick(i)}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Home Screen Component
function HomeScreen({ onTip, onShare, onOpenProfile, onOpenComments }: { onTip: (postId: number) => void; onShare: (postId: number) => void; onOpenProfile: () => void; onOpenComments: (post: any) => void; }) {
  const [likes, setLikes] = useState<{[key: number]: number}>({1: 24, 2: 18});
  const [liked, setLiked] = useState<{[key: number]: boolean}>({1: false, 2: false});

  const handleLike = (postId: number) => {
    setLiked(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    setLikes(prev => {
      const current = prev[postId] ?? 0;
      const isLiked = liked[postId] ?? false;
      return {
        ...prev,
        [postId]: current + (isLiked ? -1 : 1),
      };
    });
  };

  const handleTip = (postId: number) => {
    onTip(postId);
  };

  const handleShare = (postId: number) => {
    onShare(postId);
  };

  // New: text composer + user-created posts state
  const [textDraft, setTextDraft] = useState<string>("");
  const [userPosts, setUserPosts] = useState<
    { id: number; text: string; author?: string; timeAgo?: string }[]
  >([]);
  // Real posts from Neon
  const { data: sessionHome } = useSession();
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingPosts(true);
        const res = await fetch('/api/posts', { cache: 'no-store' });
        const data = await res.json();
        if (active) setDbPosts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setDbPosts([]);
      } finally {
        if (active) setLoadingPosts(false);
      }
    })();
    return () => { active = false };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Discover</h1>

      {/* Text post composer for all users */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>YOU</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                rows={3}
                placeholder="Share something with your community..."
                value={textDraft}
                onChange={(e) => setTextDraft(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  disabled={!textDraft.trim()}
                  onClick={async () => {
                    const title = textDraft.trim();
                    if (!title) return;
                    if (!sessionHome?.user) {
                      alert('Please sign in to post');
                      return;
                    }
                    const r = await fetch('/api/posts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title })
                    });
                    if (!r.ok) {
                      const { error } = await r.json().catch(() => ({ error: 'Failed to post' }));
                      alert(error || 'Failed to post');
                      return;
                    }
                    setTextDraft('');
                    // Reload posts from DB
                    try {
                      const res = await fetch('/api/posts', { cache: 'no-store' });
                      const data = await res.json();
                      setDbPosts(Array.isArray(data) ? data : []);
                    } catch {}
                  }}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts from Neon */}
      {loadingPosts ? (
        <p className="text-sm text-muted-foreground">Loading posts…</p>
      ) : dbPosts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        dbPosts.map((p: any) => (
          <Card key={p.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback>{(p.authorId || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <button className="font-semibold text-foreground text-left hover:underline" onClick={onOpenProfile}>
                    {p.authorId}
                  </button>
                  <p className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-foreground mb-3">{p.title}</p>
              {p.content && <p className="text-sm text-muted-foreground">{p.content}</p>}
              <EngagementActions
                liked={false}
                likes={0}
                onLike={() => {}}
                onTip={() => onTip(0)}
                onShare={() => onShare(0)}
                onComment={() => onOpenComments({ id: p.id, imageTitle: p.title, comments: [] })}
              />
            </CardContent>
          </Card>
        ))
      )}
      
      {/* Post 1 - Photographer */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <button className="font-semibold text-foreground text-left hover:underline" onClick={onOpenProfile}>
                John Photographer
              </button>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
          </div>
          <p className="text-foreground mb-3">Amazing sunset shoot today! 📸 The colors were absolutely breathtaking.</p>
          <EngagementActions
            liked={liked[1]}
            likes={likes[1]}
            onLike={() => handleLike(1)}
            onTip={() => handleTip(1)}
            onShare={() => handleShare(1)}
            onComment={() => onOpenComments({ id: 1, imageTitle: 'Amazing sunset shoot today!', comments: [] })}
          />
        </CardContent>
      </Card>

      {/* Post 2 - Sculptor */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <button className="font-semibold text-foreground text-left hover:underline" onClick={onOpenProfile}>
                Maria Sculptor
              </button>
              <p className="text-sm text-muted-foreground">5 hours ago</p>
            </div>
          </div>
          <p className="text-foreground mb-3">New marble sculpture finished! 🗿 This piece took 3 months to complete.</p>
          <EngagementActions
            liked={liked[2]}
            likes={likes[2]}
            onLike={() => handleLike(2)}
            onTip={() => handleTip(2)}
            onShare={() => handleShare(2)}
            onComment={() => onOpenComments({ id: 2, imageTitle: 'New marble sculpture finished!', comments: [] })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Services Screen Component
function ServicesScreen({ onServiceClick }: { onServiceClick: (service: { name: string; price: string; description: string }) => void }) {
  const [services, setServices] = useState(
    [
    { name: "Portrait Photography", price: "$50", description: "Professional portrait sessions" },
    { name: "Event Photography", price: "$100", description: "Weddings, parties, events" },
    { name: "Photo Editing", price: "$30", description: "Professional photo retouching" },
    { name: "Sculpture Commission", price: "$200", description: "Custom marble sculptures" },
    { name: "Art Consultation", price: "$75", description: "Professional art advice" },
    { name: "Digital Art", price: "$60", description: "Custom digital artwork" },
  ] as { name: string; price: string; description: string }[]
  );

  const handleServiceClick = (serviceName: string) => {
    const svc = services.find(s => s.name === serviceName);
    if (svc) onServiceClick(svc);
  };

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addService = () => {
    if (!newName.trim() || !newPrice.trim()) { alert("Please enter name and price"); return; }
    setServices([{ name: newName.trim(), price: newPrice.trim(), description: newDesc.trim() }, ...services]);
    setShowAdd(false); setNewName(""); setNewPrice(""); setNewDesc("");
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Services</h1>
        <Button size="sm" variant="outline" onClick={() => setShowAdd(v=>!v)}>
          {showAdd ? "Cancel" : "Add Service"}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <LabeledInput label="Service Name" type="text" value={newName} onChange={(e)=>setNewName(e.target.value)} />
            <LabeledInput label="Price" type="text" value={newPrice} onChange={(e)=>setNewPrice(e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <Textarea rows={3} value={newDesc} onChange={(e)=>setNewDesc(e.target.value)} placeholder="Describe your service" />
            </div>
            <Button className="w-full" onClick={addService}>Save Service</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {services.map((service, index) => (
          <Card 
            key={index} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleServiceClick(service.name)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{service.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                </div>
                <span className="font-bold text-green-600 text-lg">{service.price}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Photo Screen Component
function PhotoScreen({ uploadedPosts = [], onImageClick, onTip, onShare, onOpenProfile, onUpdatePost, onDeletePost, onComment }: { uploadedPosts?: any[]; onImageClick: (post: any) => void; onTip: (postId: number) => void; onShare: (postId: number) => void; onOpenProfile: () => void; onUpdatePost: (id: number, patch: any) => void; onDeletePost: (id: number) => void; onComment: (post: any) => void; }) {
  const [likes, setLikes] = useState<{[key: number]: number}>({1: 45, 2: 32, 3: 67, 4: 28, 5: 89});
  const [liked, setLiked] = useState<{[key: number]: boolean}>({1: false, 2: false, 3: false, 4: false, 5: false});
  const [replyDrafts, setReplyDrafts] = useState<{[key:string]: string}>({});
  const [replyOpen, setReplyOpen] = useState<{[key:string]: boolean}>({});
  const [extraReplies, setExtraReplies] = useState<{[postId:number]: {[index:number]: any[]}}>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{title:string; stoneType:string; story:string; description:string; tagsText:string}>({ title:"", stoneType:"", story:"", description:"", tagsText:"" });

  const sculptorPosts = [
    {
      id: 1,
      sculptorName: "Maria Sculptor",
      username: "@mariasculpts",
      timeAgo: "2 hours ago",
      imageTitle: "Marble Goddess",
      description: "Finished this marble sculpture after 4 months of work. The details were challenging but worth it! 🗿",
      comments: [
        { name: "Art Lover", text: "Absolutely stunning! The details are incredible", time: "1h ago", tip: "$5" },
        { name: "John Artist", text: "Your work inspires me so much!", time: "45m ago", tip: "$3" }
      ]
    },
    {
      id: 2,
      sculptorName: "David Stone",
      username: "@davidstoneart",
      timeAgo: "5 hours ago",
      imageTitle: "Bronze Warrior",
      description: "New bronze piece inspired by ancient Greek warriors. The patina process took weeks! ⚔️",
      comments: [
        { name: "Sculpture Fan", text: "The texture is amazing!", time: "3h ago", tip: "$7" },
        { name: "Emma Art", text: "How long did this take to make?", time: "2h ago", tip: "$2" }
      ]
    },
    {
      id: 3,
      sculptorName: "Luna Clay",
      username: "@lunaclayworks",
      timeAgo: "1 day ago",
      imageTitle: "Ceramic Dreams",
      description: "Experimental ceramic piece exploring fluid forms. Glazed with custom turquoise finish. 🏺",
      comments: [
        { name: "Clay Master", text: "Beautiful glaze work!", time: "12h ago", tip: "$4" },
        { name: "Pottery Pro", text: "The form is so organic, love it!", time: "8h ago", tip: "$6" }
      ]
    },
    {
      id: 4,
      sculptorName: "Alex Modern",
      username: "@alexmodernsculpt",
      timeAgo: "2 days ago",
      imageTitle: "Steel Abstract",
      description: "Industrial meets art in this welded steel sculpture. Playing with negative space and light. 🏗️",
      comments: [
        { name: "Metal Artist", text: "Great use of industrial materials!", time: "1d ago", tip: "$8" },
        { name: "Design Fan", text: "The shadows it creates must be amazing", time: "20h ago", tip: "$3" }
      ]
    },
    {
      id: 5,
      sculptorName: "Sophia Wood",
      username: "@sophiawoodcarver",
      timeAgo: "3 days ago",
      imageTitle: "Wood Spirit",
      description: "Hand-carved oak sculpture representing forest spirits. Every curve tells a story. 🌳",
      comments: [
        { name: "Wood Worker", text: "Incredible craftsmanship!", time: "2d ago", tip: "$10" },
        { name: "Nature Art", text: "You can feel the spirit in this piece", time: "1d ago", tip: "$5" }
      ]
    }
  ];

  const handleLike = (postId: number) => {
    setLiked(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    setLikes(prev => {
      const current = prev[postId] ?? 0;
      const isLiked = liked[postId] ?? false;
      return {
        ...prev,
        [postId]: current + (isLiked ? -1 : 1),
      };
    });
  };

  const handleTip = (postId: number) => {
    onTip(postId);
  };

  const handleImageClick = (postId: number) => {
    onImageClick(postId);
  };

  const handleTipComment = (commenterName: string) => {
    alert(`Tipping ${commenterName}`);
  };

  const handleShare = (postId: number) => {
    onShare(postId);
  };

  const allPosts = [...(uploadedPosts || []), ...sculptorPosts];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-background">
        <h1 className="text-2xl font-bold text-foreground">Sculptor Feed</h1>
        <p className="text-sm text-muted-foreground">Discover amazing sculptures from talented artists</p>
      </div>
      
      <div className="flex-1 overflow-y-auto scroll-smooth-touch">
        {allPosts.map((post: any) => (
          <Card key={post.id} className="mb-4 border-0 shadow-sm">
            <CardContent className="p-0">
              {/* Sculptor Info */}
              <div className="p-4 pb-2">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>{(post.sculptorName || "U").split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <button className="font-semibold text-foreground text-left hover:underline" onClick={onOpenProfile}>
                      {post.sculptorName || "Unknown Artist"}
                    </button>
                    <p className="text-sm text-muted-foreground">{post.username || "@unknown"} • {post.timeAgo || "now"}</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div 
                className="w-full h-64 bg-gradient-to-br cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => handleImageClick(post)}
                style={{
                  background: getGradientForPost(post.id || 1)
                }}
              ></div>

              {/* Post Content */}
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{post.imageTitle || post.title}</h3>
                {post.description && <p className="text-foreground mb-3">{post.description}</p>}
                
                {/* Owner controls for uploaded posts */}
                {post.isUploaded && editingId !== post.id && (
                  <div className="flex justify-end gap-2 mb-3">
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditingId(post.id);
                      setEditForm({
                        title: post.imageTitle || post.title || "",
                        stoneType: post.stoneType || "",
                        story: post.story || "",
                        description: post.description || "",
                        tagsText: Array.isArray(post.tags) ? post.tags.join(", ") : "",
                      });
                    }}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => onDeletePost(post.id)}>Delete</Button>
                  </div>
                )}

                {/* Inline Edit Form */}
                {post.isUploaded && editingId === post.id && (
                  <div className="mb-3 p-3 border rounded space-y-2">
                    <LabeledInput label="Title" type="text" value={editForm.title} onChange={(e)=>setEditForm({...editForm, title: e.target.value})} />
                    <LabeledInput label="Stone Type" type="text" value={editForm.stoneType} onChange={(e)=>setEditForm({...editForm, stoneType: e.target.value})} />
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Story</label>
                      <Textarea rows={3} value={editForm.story} onChange={(e)=>setEditForm({...editForm, story: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                      <Textarea rows={2} value={editForm.description} onChange={(e)=>setEditForm({...editForm, description: e.target.value})} />
                    </div>
                    <LabeledInput label="Tags (comma separated)" type="text" value={editForm.tagsText} onChange={(e)=>setEditForm({...editForm, tagsText: e.target.value})} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => {
                        const tags = editForm.tagsText.split(',').map(t=>t.trim()).filter(Boolean);
                        onUpdatePost(post.id, { imageTitle: editForm.title, title: editForm.title, stoneType: editForm.stoneType, story: editForm.story, description: editForm.description, tags });
                        setEditingId(null);
                      }}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Uploaded details */}
                {post.story || post.stoneType || (post.tags && post.tags.length > 0) ? (
                  <div className="mb-3 text-sm text-foreground space-y-1">
                    {post.stoneType && <p><span className="text-muted-foreground">Stone Type:</span> {post.stoneType}</p>}
                    {post.story && <p><span className="text-muted-foreground">Story:</span> {post.story}</p>}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {post.tags.map((t: string, i: number) => (
                          <Badge key={i} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Engagement Buttons */}
                <div className="mb-4">
                  <EngagementActions
                    liked={!!liked[post.id]}
                    likes={likes[post.id] ?? 0}
                    onLike={() => handleLike(post.id)}
                    onTip={() => handleTip(post.id)}
                    onShare={() => handleShare(post.id)}
                    onComment={() => onComment(post)}
                  />
                </div>

                {/* Comments (only for sample posts) */}
                {post.comments ? (
                  <div className="space-y-3">
                    {post.comments.map((comment: any, index: number) => {
                      const key = `${post.id}:${index}`;
                      const replies = extraReplies[post.id]?.[index] || [];
                      return (
                        <div key={index} className="flex gap-3">
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback>{comment.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm text-foreground">{comment.name}</p>
                                <p className="text-sm text-foreground">{comment.text}</p>
                              </div>
                              <div className="text-right ml-2">
                                <p className="text-xs text-muted-foreground">{comment.time}</p>
                                <button 
                                  className="text-xs text-green-600 font-medium hover:text-green-700 mr-2"
                                  onClick={() => handleTipComment(comment.name)}
                                >
                                  💰 {comment.tip}
                                </button>
                                <button
                                  className="text-xs text-blue-600 font-medium hover:text-blue-700"
                                  onClick={() => setReplyOpen(prev => ({...prev, [key]: !prev[key]}))}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                            {/* Existing replies (sample doesn’t include nested; we show added ones) */}
                            {replies.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {replies.map((r: any, i: number) => (
                                  <div key={i} className="flex gap-2 pl-10">
                                    <Avatar className="h-6 w-6 flex-shrink-0">
                                      <AvatarFallback>{r.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="text-xs text-foreground"><span className="font-medium">{r.name}</span> {r.text}</p>
                                      <p className="text-[10px] text-muted-foreground">{r.time}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {replyOpen[key] && (
                              <div className="mt-2 flex gap-2 pl-10">
                                <Input
                                  placeholder="Write a reply..."
                                  value={replyDrafts[key] || ""}
                                  onChange={(e)=> setReplyDrafts(prev=>({...prev, [key]: e.target.value}))}
                                  onKeyDown={(e)=> { if (e.key === 'Enter') {
                                    const text = (replyDrafts[key] || '').trim();
                                    if (text) {
                                      setExtraReplies(prev => ({
                                        ...prev,
                                        [post.id]: {
                                          ...(prev[post.id] || {}),
                                          [index]: [ ...(prev[post.id]?.[index] || []), { name: 'You', text, time: 'now' } ]
                                        }
                                      }));
                                      setReplyDrafts(prev=> ({...prev, [key]: ''}));
                                      setReplyOpen(prev=> ({...prev, [key]: false}));
                                    }
                                  }}}
                                  className="flex-1"
                                />
                                <Button size="sm" onClick={() => {
                                  const text = (replyDrafts[key] || '').trim();
                                  if (!text) return;
                                  setExtraReplies(prev => ({
                                    ...prev,
                                    [post.id]: {
                                      ...(prev[post.id] || {}),
                                      [index]: [ ...(prev[post.id]?.[index] || []), { name: 'You', text, time: 'now' } ]
                                    }
                                  }));
                                  setReplyDrafts(prev=> ({...prev, [key]: ''}));
                                  setReplyOpen(prev=> ({...prev, [key]: false}));
                                }}>Send</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Edit Profile Screen
function EditProfileScreen({ onBack, name, handle, bio, setName, setHandle, setBio }: { onBack: () => void; name: string; handle: string; bio: string; setName: (v: string)=>void; setHandle: (v: string)=>void; setBio: (v: string)=>void; }) {
  const save = () => {
    alert("Profile updated");
    onBack();
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">Edit Profile</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <LabeledInput label="Display Name" type="text" value={name} onChange={(e)=>setName(e.target.value)} />
          <LabeledInput label="Handle" type="text" value={handle} onChange={(e)=>setHandle(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
            <Textarea rows={4} value={bio} onChange={(e)=>setBio(e.target.value)} placeholder="Tell something about you..." />
          </div>
          <Button className="w-full" onClick={save}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Booking Form Screen
function BookingFormScreen({ service, onBack }: { service: { name: string; price: string; description: string } | null; onBack: () => void }) {
  const [clientName, setClientName] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  if (!service) return (
    <div className="p-4"><Button variant="ghost" size="sm" onClick={onBack}>Back</Button><p className="mt-2">No service selected.</p></div>
  );
  const submit = () => {
    if (!clientName || !date) { alert("Please enter your name and preferred date"); return; }
    alert(`Request sent for ${service.name} on ${date}. We'll get back to you!`);
    onBack();
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">Book: {service.name}</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">{service.description} • <span className="font-semibold text-green-600">{service.price}</span></p>
          <LabeledInput label="Your Name" type="text" value={clientName} onChange={(e)=>setClientName(e.target.value)} />
          <LabeledInput label="Preferred Date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
            <Textarea rows={4} value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Any additional details..." />
          </div>
          <Button className="w-full" onClick={submit}>Submit Booking Request</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Messages Screen Component
function MessagesScreen({ onBack }: { onBack: () => void }) {
  const [message, setMessage] = useState("");
  const [list, setList] = useState<string[]>([]);
  const send = () => { if (message.trim()) { setList([...list, message.trim()]); setMessage(""); } };
  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
          <h2 className="text-lg font-semibold">Direct Messages</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {list.length === 0 ? <p className="text-muted-foreground text-sm">No messages yet</p> : list.map((m,i)=>(
          <div key={i} className="bg-accent/40 text-foreground rounded px-3 py-2 w-max max-w-[80%]">{m}</div>
        ))}
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Type a message..." onKeyDown={(e)=> e.key==='Enter' && send()} />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}

// Tip Screen Component
function TipScreen({ postId, onBack }: { postId: number | null; onBack: () => void }) {
  const [amount, setAmount] = useState<string>("5");
  const [txnId, setTxnId] = useState<string>("");
  const txnOk = txnId.trim().length > 0;
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">Send a Tip</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Post #{postId ?? '—'}</p>
          <div className="flex gap-2">
            {["1","3","5","10"].map(v => (
              <Button key={v} variant={amount===v?"default":"outline"} size="sm" onClick={()=>setAmount(v)}>${v}</Button>
            ))}
          </div>
          <LabeledInput label="Custom Amount" type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} />
          <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="w-full">Confirm Tip ${amount}</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-[92vw] sm:max-w-[360px] p-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Send Ecocash</AlertDialogTitle>
                          <AlertDialogDescription>
                            Please send ${amount} to +263 77 123 4567 to complete the tip.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 mt-2">
                          <LabeledInput
                            label="TxnID"
                            placeholder="Enter your Ecocash transaction ID"
                            value={txnId}
                            onChange={(e)=>setTxnId(e.target.value)}
                          />
                          <p className="text-[11px] text-muted-foreground">We’ll use this to confirm your payment.</p>
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Close</AlertDialogCancel>
                          <AlertDialogAction disabled={!txnOk}>OK</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

// Share Screen Component
function ShareScreen({ postId, onBack }: { postId: number | null; onBack: () => void }) {
  const url = typeof window !== 'undefined' ? window.location.href + `#post-${postId ?? ''}` : '';
  const copy = async () => { try { await navigator.clipboard.writeText(url); alert('Link copied!'); } catch { alert('Copy failed'); } };
  const nativeShare = async () => {
    // best-effort share
    // @ts-ignore
    if (navigator.share) {
      // @ts-ignore
      navigator.share({ title: 'artbase', text: 'Check out this post', url });
    } else {
      copy();
    }
  };
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">Share Post</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">Post #{postId ?? '—'}</p>
          <Input readOnly value={url} />
          <div className="flex gap-2">
            <Button onClick={copy} variant="outline">Copy Link</Button>
            <Button onClick={nativeShare}>Share...</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Comments Screen Component
function CommentsScreen({ post, onBack }: { post: any | null; onBack: () => void; onAddComment?: (comment: { name: string; text: string; time: string }) => void }) {
  const [list, setList] = useState<any[]>(post?.comments ? [...post.comments] : []);
  const [text, setText] = useState<string>("");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    const newComment = { name: "You", text: t, time: "now" };
    setList(prev => [...prev, newComment]);
    setText("");
  };
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-lg font-semibold">Comments</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          list.map((c, i) => (
            <div key={i} className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback>{c.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-foreground"><span className="font-medium">{c.name}</span> {c.text}</p>
                <p className="text-xs text-muted-foreground">{c.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t flex gap-2">
        <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Write a comment..." onKeyDown={(e)=> e.key==='Enter' && add()} />
        <Button onClick={add}>Post</Button>
      </div>
    </div>
  );
}

// Tip History Screen Component
function TipHistoryScreen({ onBack }: { onBack: () => void }) {
  const [range, setRange] = useState<'Daily'|'Monthly'|'Yearly'>("Daily");
  const totals: Record<string, { count: number; amount: number }> = {
    Daily: { count: 5, amount: 23 },
    Monthly: { count: 102, amount: 487 },
    Yearly: { count: 1100, amount: 5340 },
  };
  const t = totals[range];
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">Tip History</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex gap-2">
            {(["Daily","Monthly","Yearly"] as const).map(r => (
              <Button key={r} variant={range===r?"default":"outline"} size="sm" onClick={()=>setRange(r)}>{r}</Button>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">Total Tips ({range})</p>
            <p className="text-2xl font-bold text-foreground">${t.amount} <span className="text-sm text-muted-foreground">from {t.count} tips</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Service Detail Screen
function ServiceDetailScreen({ service, onBack, onBook }: { service: { name: string; price: string; description: string } | null; onBack: () => void; onBook: () => void; }) {
  if (!service) return (
    <div className="p-4"><Button variant="ghost" size="sm" onClick={onBack}>Back</Button><p className="mt-2">No service selected.</p></div>
  );
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-xl font-semibold">{service.name}</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-2">
          <p className="text-muted-foreground">{service.description}</p>
          <p className="font-bold text-green-600 text-lg">{service.price}</p>
          <Button className="w-full" onClick={onBook}>Book Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Screen
function SettingsScreen({ onBack, onEditProfile, onMessages, onLogout, userRole, setUserRole }: { onBack?: () => void; onEditProfile: () => void; onMessages: () => void; onLogout: () => void; userRole: "creator" | "general"; setUserRole: (r: "creator" | "general") => void; }) {
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [dmNotifications, setDmNotifications] = useState<boolean>(true);
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        )}
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Profile Type</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Current: {userRole === "creator" ? "Sculptor/Photographer" : "General User"}</span>
            <div className="flex gap-2">
              <Button size="sm" variant={userRole === "creator" ? "default" : "outline"} onClick={() => setUserRole("creator")}>Creator</Button>
              <Button size="sm" variant={userRole === "general" ? "default" : "outline"} onClick={() => setUserRole("general")}>General</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <Button variant="outline" size="sm" onClick={() => setEmailNotifications(v=>!v)}>{emailNotifications?"On":"Off"}</Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Direct message alerts</span>
            <Button variant="outline" size="sm" onClick={() => setDmNotifications(v=>!v)}>{dmNotifications?"On":"Off"}</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 space-y-3">
          <h3 className="font-semibold">Account</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onEditProfile}>Edit Profile</Button>
            <Button variant="outline" onClick={onMessages}>Messages</Button>
          </div>
          <Button variant="outline" className="w-full mt-2" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Photo Full Screen view
function PhotoFullScreen({ post, onBack }: { post: any | null; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
        <h2 className="text-lg font-semibold">{post?.imageTitle || post?.title || 'Post'}</h2>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1" style={{ background: getGradientForPost((post?.id || 1)) }}>
          <div className="sr-only">Full screen image for post</div>
        </div>
        <div className="p-4 space-y-2 border-t">
          {post?.stoneType && <p className="text-sm"><span className="text-muted-foreground">Stone Type:</span> {post.stoneType}</p>}
          {post?.story && <p className="text-sm"><span className="text-muted-foreground">Story:</span> {post.story}</p>}
          {post?.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t: string, i: number) => (
                <Badge key={i} variant="secondary">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate different gradients for each post
function getGradientForPost(postId: number): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Orange
  ];
  return gradients[(postId - 1) % gradients.length];
}