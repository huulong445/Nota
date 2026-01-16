"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  User,
  Mail,
  AtSign,
  Lock,
  Save,
  Loader2,
  Shield,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();

  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const hasPasswordEnabled = user?.passwordEnabled ?? false;
  const hasExternalAccount =
    user?.externalAccounts && user.externalAccounts.length > 0;

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  const handleUpdateUsername = async () => {
    if (!user) return;

    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (username === user.username) {
      toast.info("No changes to save");
      return;
    }

    setIsUpdatingUsername(true);
    try {
      await user.update({ username });
      toast.success("Username updated successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update username";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    if (!hasPasswordEnabled) {
      toast.error(
        "Password change is not available for accounts linked with external providers"
      );
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await user.updatePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-10 p-6 bg-muted/50 rounded-lg">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.imageUrl} />
            <AvatarFallback className="text-2xl">
              {user.firstName?.charAt(0) || user.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{user.fullName}</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {hasExternalAccount && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>
                  Linked with{" "}
                  {user.externalAccounts[0].provider.replace("oauth_", "")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-6 mb-10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </h3>

          <div className="grid gap-4 p-6 border rounded-lg">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                value={user.fullName || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Name is managed by your linked account
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                value={user.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email is managed by your linked account
              </p>
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Member Since
              </Label>
              <Input
                value={
                  user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""
                }
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Username Section */}
        <div className="space-y-6 mb-10">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AtSign className="h-5 w-5" />
            Username
          </h3>

          <div className="p-6 border rounded-lg space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <p className="text-xs text-muted-foreground">
                Your unique username on Nota
              </p>
            </div>

            <Button
              onClick={handleUpdateUsername}
              disabled={isUpdatingUsername || username === user.username}
            >
              {isUpdatingUsername ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Username
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Password
          </h3>

          {hasPasswordEnabled ? (
            <div className="p-6 border rounded-lg space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters
                </p>
              </div>

              <Button
                onClick={handleUpdatePassword}
                disabled={
                  isUpdatingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="p-6 border rounded-lg bg-muted/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-full">
                  <ExternalLink className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">You can't change your password</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is linked with an external provider (
                    {user.externalAccounts[0]?.provider.replace("oauth_", "") ||
                      "OAuth"}
                    ). Password is managed by that provider.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
