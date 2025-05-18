import { supabase } from './supabase.js';

// Sign up a new user
export const signUp = async (email, password, userData) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.full_name || userData.fullName || '',
                    // Add any additional user data here
                }
            }
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Sign in a user
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Sign out the current user
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Send password reset email
export const resetPassword = async (email) => {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/auth-reset-password.html`,
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Get the current user
export const getCurrentUser = () => {
    return supabase.auth.getUser();
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};
