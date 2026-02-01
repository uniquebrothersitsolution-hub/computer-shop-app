import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function LoginScreen() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter username and password');
            return;
        }

        setLoading(true);
        const result = await login({ username, password });
        setLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.content}>
                    {/* Logo */}
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />

                    {/* Title */}
                    <Text style={styles.title}>Unique Brothers</Text>
                    <Text style={styles.subtitle}>
                        Browsing | Designing | LED Board | Stickers | Gifts
                    </Text>
                    <Text style={styles.signInText}>Sign in to your account</Text>

                    {/* Login Form */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor={COLORS.textMuted}
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={COLORS.white} />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footer}>
                        © {new Date().getFullYear()} Unique Brothers. All rights reserved.
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgPrimary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    content: {
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: SPACING.md,
        borderRadius: RADIUS.full,
    },
    title: {
        fontSize: FONTS.sizes.xxxl,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FONTS.sizes.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    signInText: {
        fontSize: FONTS.sizes.base,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
    },
    form: {
        width: '100%',
        maxWidth: 400,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: FONTS.sizes.sm,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.bgSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        fontSize: FONTS.sizes.base,
        color: COLORS.textPrimary,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: RADIUS.md,
    },
    passwordInput: {
        flex: 1,
        padding: SPACING.md,
        fontSize: FONTS.sizes.base,
        color: COLORS.textPrimary,
    },
    eyeIcon: {
        padding: SPACING.md,
    },
    eyeText: {
        fontSize: 20,
    },
    button: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.md,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: FONTS.sizes.base,
        fontWeight: '600',
    },
    footer: {
        fontSize: FONTS.sizes.xs,
        color: COLORS.textMuted,
        marginTop: SPACING.xl,
        textAlign: 'center',
    },
});
