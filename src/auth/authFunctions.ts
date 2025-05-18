import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

// Google認証 初期化（App起動時に一度だけ呼ぶこと）
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: '967202432623-buht8vc13aacth00be9skc4fl1d2scum.apps.googleusercontent.com', // Firebaseコンソールから取得
  });
};

// メールアドレスでサインアップ
export const signUpWithEmail = async (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

// メールアドレスでサインイン
export const signInWithEmail = async (email: string, password: string) => {
  return auth().signInWithEmailAndPassword(email, password);
};

// Google認証
export const signInWithGoogle = async () => {
  const userInfo = await GoogleSignin.signIn() as any;
  const idToken = userInfo.idToken;
  if (!idToken) throw new Error('Google認証のidTokenが取得できません');
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(googleCredential);
};

// ユーザー情報をFirestoreに保存
export const saveUserToFirestore = async (user: { uid: string, email: string | null, userName?: string | null }) => {
  const userRef = firestore().collection('users').doc(user.uid);
  await userRef.set({
    userName: user.userName || '',
    email: user.email || '',
    createdAt: firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
};

export const createUserDocument = async ({
  uid,
  userName,
  email,
}: {
  uid: string;
  userName: string;
  email: string;
}) => {
  // usersコレクションにドキュメント作成
  await firestore().collection('users').doc(uid).set({
    userName,
    email,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  // mitotchiStateサブコレクションの初期化
  await firestore()
    .collection('users')
    .doc(uid)
    .collection('mitotchiState')
    .doc('default')
    .set({
      level: 1,
      experience: 0,
      decorations: [],
      unlockedBuddies: [],
      currentDecoration: '',
    });
}; 