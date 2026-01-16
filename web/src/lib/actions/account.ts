// lib/actions/account.ts
"use server";

import { createServerClient } from "../pocketbase/server";
import { ClientResponseError } from "pocketbase";
import { revalidatePath } from "next/cache";

interface AccountResult {
  error?: string;
  errors?: string[];
  success?: boolean;
  redirect?: string;
  warning?: string;
}

export async function updateProfile(formData: FormData): Promise<AccountResult> {
  const client = await createServerClient();

  if (!client.authStore.model?.id) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const password = formData.get("password") as string | null;
  const passwordConfirm = formData.get("passwordConfirm") as string | null;
  const currentPassword = formData.get("currentPassword") as string | null;



  try {
    // Prepare update data
    const updateData: {
      name?: string;
      password?: string;
      passwordConfirm?: string;
      oldPassword?: string;
    } = {};
    
    if (name && name.trim() !== client.authStore.model.name) {
      updateData.name = name.trim();
    }
    
    // Only handle password change if new password is provided and not empty
    const isPasswordChangeRequested = password && password.trim().length > 0;
    
    if (isPasswordChangeRequested) {
      if (!currentPassword || currentPassword.trim().length === 0) {
        return { error: "Current password is required to change password" };
      }
      
      if (!passwordConfirm || passwordConfirm.trim().length === 0) {
        return { error: "Password confirmation is required" };
      }
      
      if (password.trim() !== passwordConfirm.trim()) {
        return { error: "Passwords do not match" };
      }
      
      // For PocketBase, we need to include oldPassword in the update data
      updateData.password = password.trim();
      updateData.passwordConfirm = passwordConfirm.trim();
      updateData.oldPassword = currentPassword.trim();
    }

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return { error: "No changes detected" };
    }

    // Store user email before update (in case the auth state gets cleared)
    const userEmail = client.authStore.model.email;
    
    // Update the user record
    await client.collection("users").update(client.authStore.model.id, updateData);

    // If password was changed, re-authenticate with the new password
    if (isPasswordChangeRequested) {
      try {
        // Re-authenticate with the new password
        await client.collection("users").authWithPassword(
          userEmail,
          password.trim()
        );
      } catch (error) {
        console.error("Failed to re-authenticate after password change:", error);
        // Don't fail the update if re-authentication fails, but return a warning
        return { 
          success: true, 
          warning: "Password changed successfully, but please log in again if you experience issues." 
        };
      }
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error instanceof ClientResponseError) {
      const validationErrors = error.data?.data;
      if (validationErrors) {
        const errors: string[] = [];
        for (const field in validationErrors) {
          const fieldError = validationErrors[field];
          
          if (fieldError.code === "validation_not_unique") {
            if (field === "name") {
              errors.push("This name is already taken");
            }
          } else if (fieldError.message) {
            // Map specific validation errors to user-friendly messages
            if (field === "password" && fieldError.message.includes("Must be at least 8 character")) {
              errors.push("Password must be at least 8 characters long");
            } else if (field === "passwordConfirm" && fieldError.message.includes("don't match")) {
              errors.push("Passwords do not match");
            } else if (field === "oldPassword" && fieldError.message.includes("Old password is invalid")) {
              errors.push("Current password is incorrect");
            } else if (fieldError.message.includes("Cannot be blank")) {
              errors.push(`${field} cannot be blank`);
            } else {
              errors.push(`${field}: ${fieldError.message}`);
            }
          }
        }
        if (errors.length > 0) {
          return { errors };
        }
      }
      return { error: error.message || "Failed to update profile" };
    }
    
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteAccount(): Promise<AccountResult> {
  const client = await createServerClient();

  if (!client.authStore.model?.id) {
    return { error: "Not authenticated" };
  }

  try {
    await client.collection("users").delete(client.authStore.model.id);
    await client.authStore.clear();
    
    return { redirect: "/login" };
  } catch (error) {
    console.error("Delete account error:", error);
    return { error: "Failed to delete account" };
  }
}
