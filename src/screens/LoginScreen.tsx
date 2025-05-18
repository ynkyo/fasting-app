import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmail, signInWithGoogle, configureGoogleSignIn } from '../auth/authFunctions';

export default function LoginScreen({ onSignUp }: { onSignUp?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log in to your account</Text>

      {/* Google認証ボタン */}
      <TouchableOpacity style={styles.googleButton} onPress={async () => {
        setLoading(true);
        try {
          await signInWithGoogle();
          // 認証後の画面遷移はonAuthStateChangedで自動
        } catch (e) {
          Alert.alert('Google認証に失敗しました');
        } finally {
          setLoading(false);
        }
      }}>
        <View style={styles.googleIconContainer}>
          <Image source={require('../../assets/google_logo.png')} style={styles.googleIcon} />
        </View>
        <Text style={styles.googleButtonText}>CONTINUE WITH GOOGLE</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>OR LOG IN WITH EMAIL</Text>

      {/* メールアドレス入力 */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#A1A4B2"
      />
      {/* パスワード入力 */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#A1A4B2"
      />

      {/* ログインボタン */}
      <TouchableOpacity
        style={styles.getStartedButton}
        onPress={async () => {
          setLoading(true);
          try {
            await signInWithEmail(email, password);
            // 認証後の画面遷移はonAuthStateChangedで自動
          } catch (e) {
            Alert.alert('ログインに失敗しました');
          } finally {
            setLoading(false);
          }
        }}
      >
        <Text style={styles.getStartedButtonText}>LOG IN</Text>
      </TouchableOpacity>

      {/* サインアップ画面へのリンク */}
      <TouchableOpacity onPress={onSignUp} style={{ marginTop: 24, alignItems: 'center' }}>
        <Text style={{ color: '#8E97FD', fontSize: 14 }}>アカウントをお持ちでない方はこちら</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator style={{marginTop: 16}} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3F414E',
    marginBottom: 32,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 38,
    borderWidth: 1,
    borderColor: '#EBEAEC',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  googleButtonText: {
    color: '#3F414E',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
  },
  orText: {
    color: '#A1A4B2',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
  },
  input: {
    backgroundColor: '#F2F3F7',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#3F414E',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EBEAEC',
  },
  getStartedButton: {
    backgroundColor: '#8E97FD',
    borderRadius: 38,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  getStartedButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
}); 