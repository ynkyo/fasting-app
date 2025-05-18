/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Alert } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Polygon, Path, Rect, Mask, G, RadialGradient } from 'react-native-svg';
import FooterMenu from './FooterMenu';
import MyPageScreen from './MyPageScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Health Connect一時コメントアウト
// import HealthConnect, { type Permission } from 'react-native-health-connect';

const screenWidth = Dimensions.get('window').width;
const timerCircleSize = screenWidth * 0.9;
const GOAL_STEPS = 10000;

const TopScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<'today' | 'mypage' | 'signup' | 'login'>('today');
  const [lastFastingTimestamp, setLastFastingTimestamp] = useState<Date | null>(null);
  const [lastStartTimestamp, setLastStartTimestamp] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState('00:00:00');
  const [endTime, setEndTime] = useState('--:--');
  const [isFasting, setIsFasting] = useState(false);
  const [lastFastingType, setLastFastingType] = useState<'start' | 'end' | null>(null);
  const [steps, setSteps] = useState(0);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // Firestoreから最新のfastingRecordsを取得
  useEffect(() => {
    if (user) {
      const ref = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('fastingRecords')
        .orderBy('timestamp', 'desc')
        .limit(2);
      const unsubscribe = ref.onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map(doc => doc.data());
          const latest = docs[0];
          const ts = latest.timestamp && latest.timestamp.toDate ? latest.timestamp.toDate() : new Date(latest.timestamp);
          setLastFastingTimestamp(ts);
          setLastFastingType(latest.type || null);
          setIsFasting(latest.type === 'start');
          // 直前のstartを探す
          const prevStart = docs.find(d => d.type === 'start');
          setLastStartTimestamp(prevStart ? (prevStart.timestamp && prevStart.timestamp.toDate ? prevStart.timestamp.toDate() : new Date(prevStart.timestamp)) : null);
        } else {
          setLastFastingTimestamp(null);
          setLastFastingType(null);
          setIsFasting(false);
          setLastStartTimestamp(null);
        }
      });
      return () => unsubscribe();
    } else {
      // 未ログイン時はAsyncStorageから取得
      (async () => {
        const key = 'fastingRecords';
        const prev = await AsyncStorage.getItem(key);
        let records = [];
        if (prev) {
          records = JSON.parse(prev);
        }
        if (records.length > 0) {
          const last = records[records.length - 1];
          const ts = last.timestamp ? new Date(last.timestamp) : null;
          setLastFastingTimestamp(ts);
          setLastFastingType(last.type || null);
          setIsFasting(last.type === 'start');
          // 直前のstartを探す
          const prevStart = [...records].reverse().find(d => d.type === 'start');
          setLastStartTimestamp(prevStart ? new Date(prevStart.timestamp) : null);
        } else {
          setLastFastingTimestamp(null);
          setLastFastingType(null);
          setIsFasting(false);
          setLastStartTimestamp(null);
        }
      })();
    }
  }, [user]);

  // 経過時間を1秒ごとに更新
  useEffect(() => {
    const timer = setInterval(() => {
      if (lastFastingTimestamp) {
        const now = new Date();
        const diff = Math.max(0, Math.floor((now.getTime() - lastFastingTimestamp.getTime()) / 1000));
        const h = String(Math.floor(diff / 3600)).padStart(2, '0');
        const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const s = String(diff % 60).padStart(2, '0');
        setElapsed(`${h}:${m}:${s}`);
      } else {
        setElapsed('00:00:00');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lastFastingTimestamp]);

  useEffect(() => {
    if (lastFastingTimestamp) {
      const addHours = isFasting ? 16 : 8;
      const end = new Date(lastFastingTimestamp.getTime() + addHours * 60 * 60 * 1000);
      const h = String(end.getHours()).padStart(2, '0');
      const m = String(end.getMinutes()).padStart(2, '0');
      setEndTime(`${h}:${m}`);
    } else {
      setEndTime('--:--');
    }
  }, [lastFastingTimestamp, isFasting]);

  // userが存在する場合は必ずtoday画面に遷移
  useEffect(() => {
    if (user) {
      setScreen('today');
    }
  }, [user]);

  // Health Connect一時コメントアウト
  // useEffect(() => {
  //   const fetchSteps = async () => {
  //     try {
  //       // 権限リクエスト
  //       await HealthConnect.requestPermission([
  //         { accessType: 'read', recordType: 'Steps' }
  //       ]);
  //       // 今日の0:00〜23:59
  //       const start = new Date();
  //       start.setHours(0, 0, 0, 0);
  //       const end = new Date();
  //       end.setHours(23, 59, 59, 999);
  //       // UTCのISO8601文字列（Instant形式）に変換
  //       const startUtc = new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString();
  //       const endUtc = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString();
  //       // 歩数データ取得
  //       const records = await HealthConnect.readRecords("Steps", {
  //         timeRangeFilter: {
  //           operator: 'between',
  //           startTime: startUtc,
  //           endTime: endUtc,
  //         },
  //       });
  //       const total = Array.isArray(records) ? records.reduce((sum: number, rec: any) => sum + (rec.count || 0), 0) : 0;
  //       setSteps(total);
  //     } catch (e) {
  //       setSteps(0);
  //     }
  //   };
  //   fetchSteps();
  // }, []);

  // ボタン押下時の処理
  const handleFastingButton = async () => {
    try {
      const now = new Date();
      const type = isFasting ? 'end' : 'start';
      if (user) {
        if (type === 'end' && lastStartTimestamp) {
          // Startからの経過時間を計算
          const elapsedSeconds = Math.floor((now.getTime() - lastStartTimestamp.getTime()) / 1000);
          const h = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
          const m = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
          const s = String(elapsedSeconds % 60).padStart(2, '0');
          const elapsedText = `${h}:${m}:${s}`;
          const date = now.toISOString().slice(0, 10);
          await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('fastingRecords')
            .add({
              timestamp: now,
              type,
              date,
              elapsedSeconds,
              elapsedText,
            });
          Alert.alert('記録しました', `ファスティング終了（${elapsedText}）をFirestoreに保存しました`);
        } else {
          await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('fastingRecords')
            .add({
              timestamp: now,
              type,
            });
          Alert.alert('記録しました', `ファスティング${type === 'start' ? '開始' : '終了'}時刻をFirestoreに保存しました`);
        }
      } else {
        const key = 'fastingRecords';
        const prev = await AsyncStorage.getItem(key);
        let records = [];
        if (prev) {
          records = JSON.parse(prev);
        }
        if (type === 'end' && lastStartTimestamp) {
          const elapsedSeconds = Math.floor((now.getTime() - lastStartTimestamp.getTime()) / 1000);
          const h = String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0');
          const m = String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0');
          const s = String(elapsedSeconds % 60).padStart(2, '0');
          const elapsedText = `${h}:${m}:${s}`;
          const date = now.toISOString().slice(0, 10);
          records.push({ timestamp: now, type, date, elapsedSeconds, elapsedText });
          await AsyncStorage.setItem(key, JSON.stringify(records));
          Alert.alert('記録しました', `ファスティング終了（${elapsedText}）を端末に保存しました`);
        } else {
          records.push({ timestamp: now, type });
          await AsyncStorage.setItem(key, JSON.stringify(records));
          Alert.alert('記録しました', `ファスティング${type === 'start' ? '開始' : '終了'}時刻を端末に保存しました`);
        }
      }
    } catch (e) {
      Alert.alert('保存エラー', String(e));
    }
  };

  // 進捗円のための計算
  const circumference = 2 * Math.PI * ((timerCircleSize / 2) - 12);
  const totalSeconds = isFasting ? 16 * 60 * 60 : 8 * 60 * 60;
  const elapsedSeconds = lastFastingTimestamp ? Math.max(0, Math.floor((new Date().getTime() - lastFastingTimestamp.getTime()) / 1000)) : 0;
  const progress = Math.min(1, elapsedSeconds / totalSeconds);
  const dashoffset = circumference * (1 - progress);

  return (
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <SafeAreaView style={styles.container}>
        {screen === 'today' ? (
          <>
            <View style={{height: 32}} />
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {/* ヘッダー */}
            {/* ファスティング中の表示 */}
            <View style={styles.fastingInfo}>
              <Text style={styles.fastingLabel}>{isFasting ? 'You are fasting' : 'Feel free to eat.'}</Text>
              <View style={styles.timerTextOverlay}>
                  <Text style={styles.timer}>{elapsed}</Text>
                  <Text style={styles.endTime}>End time {endTime}</Text>
              </View>
            </View>
            <View style={styles.timerCircle}>
              {/* SVGサークルタイマーを下に移動 */}
              <View style={styles.timerCircleWrapper}>
                {/* 進捗円のスタート地点に宝箱アイコンを重ねる */}
                <View style={{ position: 'absolute', top: -10, left: timerCircleSize / 2 - 24, zIndex: 10 }}>
                  <RewardIcon width={48} height={42} />
                </View>
                <Svg width={timerCircleSize} height={timerCircleSize}>
                  {/* グラデーションは使わず単色で明確に分ける */}
                  {/* 背景円 */}
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={(timerCircleSize / 2) - 12}
                    stroke="#E9E9FF"
                    strokeWidth={24}
                    fill="none"
                  />
                  {/* 進捗円（仮に70%進捗） */}
                  <Circle
                    cx={timerCircleSize / 2}
                    cy={timerCircleSize / 2}
                    r={(timerCircleSize / 2) - 12}
                    stroke="#8E97FD"
                    strokeWidth={24}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${timerCircleSize / 2},${timerCircleSize / 2}`}
                  />
                </Svg>
                {/* Mitoアイコンを中央に重ねる */}
                <View style={{ position: 'absolute', top: timerCircleSize * 0.2, left: timerCircleSize * 0.3, width: timerCircleSize * 0.4, height: timerCircleSize * 0.4, justifyContent: 'center', alignItems: 'center' }}>
                  <MitoIcon width={timerCircleSize * 0.6} height={timerCircleSize * 0.6 * 193 / 229} />
                </View>
                <View style={[styles.timerTextOverlay, { width: timerCircleSize, height: timerCircleSize, position: 'absolute', top: 100, left: 0 }] }>
                  {/* ステップカウンター情報をサークル内に表示 */}
                  <Text style={[styles.stepCounter, {textAlign: 'left'}]}>Step counter</Text>
                  {/* 進捗バーもサークル内に表示 */}
                  <View style={{ width: timerCircleSize * 0.6, alignSelf: 'center', marginTop: 8 }}>
                  <View style={{ position: 'absolute', top: 0, right: timerCircleSize / 6 - 90, zIndex: 10 }}>
                    <RewardIcon width={48} height={42} />
                  </View>
                    {/* 上：Goal/steps done */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 8 }}>
                      <Text style={[styles.stepsText, { textAlign: 'right', marginTop: -25 }]}>Goal</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View style={styles.progressBarFill} />
                    </View>
                    {/* 下：数値 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: -15 }}>
                      <Text style={[styles.goalText, { textAlign: 'center'}]}><Text style={{fontWeight: 'bold', fontSize: 20}}>{steps.toLocaleString()} / {GOAL_STEPS.toLocaleString()}</Text> steps done</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {/* End Fastingボタン */}
            <TouchableOpacity style={styles.endFastingButton} onPress={handleFastingButton}>
              <Text style={styles.endFastingText}>{isFasting ? 'End Fasting' : 'Start Fasting'}</Text>
            </TouchableOpacity>
            {/* ステップカウンター＋報酬セクション */}
            <View style={{ marginTop: 30 }}>
               {/* Reward & Streak アイコン */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 16 }}>
                <View style={{ alignItems: 'center' }}>
                  <RewardIcon width={110} height={90} />
                  <Text style={{ color: '#3F414E', fontSize: 18, marginTop: 4 }}>Reward</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <StreakIcon width={110} height={90} />
                  <Text style={{ color: '#3F414E', fontSize: 18, marginTop: 4 }}>Streak</Text>
                </View>
              </View>
            </View>
          </>
        ) : screen === 'mypage' ? (
          <MyPageScreen onEdit={() => setScreen('login')} onLoginRequest={() => setScreen('login')} />
        ) : screen === 'login' ? (
          <LoginScreen onSignUp={() => setScreen('signup')} />
        ) : (
          <SignUpScreen />
        )}
      </SafeAreaView>
      <FooterMenu
        onPressToday={() => setScreen('today')}
        onPressMyPage={() => setScreen('mypage')}
      />
    </View>
  );
};

// SVGアイコンコンポーネント
const RewardIcon = ({ width = 66, height = 58 }) => (
  <Svg width={width} height={height} viewBox="0 0 66 58" fill="none">
    <Rect x="13.6829" y="2.58301" width="39.554" height="55.417" fill="#823FAB" />
    <Rect x="13.6829" y="4.46155" width="39.554" height="4.69636" fill="#905EAF" />
    <Rect x="13.6829" y="51.4251" width="39.554" height="4.69636" fill="#905EAF" />
    <Rect x="13.6829" y="40.1539" width="39.554" height="4.69636" fill="#905EAF" />
    <Rect x="13.6831" y="14.975" width="39.554" height="4.69636" fill="#905EAF" />
    <Rect x="1.72473" y="2.58301" width="11.0383" height="29.1174" fill="#D28800" />
    <Rect x="5.40417" y="30.7611" width="7.35889" height="24.4211" fill="#D28800" />
    <Rect x="53.2369" y="2.58301" width="11.0383" height="29.1174" fill="#D28800" />
    <Rect x="53.2369" y="30.7611" width="7.35889" height="24.4211" fill="#D28800" />
    <Rect x="12.7631" y="27.9433" width="40.4739" height="5.63563" fill="#FBB603" />
    <Rect x="23.8014" y="21.3684" width="18.3972" height="19.7247" rx="4" fill="#FBCF04" />
    <Path d="M33 26.0648C28.9914 26.0648 30.2163 29.8846 31.3298 31.7945C29.9936 36.0258 30.773 36.4959 31.3298 36.2021C32.4433 36.349 34.7538 36.5547 35.0878 36.2021C35.4219 35.8495 34.9486 32.823 34.6703 31.3538C35.7837 29.5908 37.0086 26.0648 33 26.0648Z" fill="#DB8E00" />
  </Svg>
);
const StreakIcon = ({ width = 66, height = 70 }) => (
  <Svg width={width} height={height} viewBox="0 0 900 1146" fill="none">
    <Defs>
      <RadialGradient id="paint0_radial_3_5" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(433.194 1148.83) rotate(-179.751) scale(674.073 1106.02)">
        <Stop offset="0.314" stopColor="#FF9800" />
        <Stop offset="0.662" stopColor="#FF6D00" />
        <Stop offset="0.972" stopColor="#F44336" />
      </RadialGradient>
      <RadialGradient id="paint1_radial_3_5" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(471.049 478.048) rotate(90.5787) scale(705.288 530.782)">
        <Stop offset="0.214" stopColor="#FFF176" />
        <Stop offset="0.328" stopColor="#FFF27D" />
        <Stop offset="0.487" stopColor="#FFF48F" />
        <Stop offset="0.672" stopColor="#FFF7AD" />
        <Stop offset="0.793" stopColor="#FFF9C4" />
        <Stop offset="0.822" stopColor="#FFF8BD" stopOpacity={0.804} />
        <Stop offset="0.863" stopColor="#FFF6AB" stopOpacity={0.529} />
        <Stop offset="0.91" stopColor="#FFF38D" stopOpacity={0.209} />
        <Stop offset="0.941" stopColor="#FFF176" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Path d="M178.646 350.769C173.203 408.83 169.383 511.582 203.666 555.318C203.666 555.318 187.527 442.444 332.201 300.825C390.453 243.815 403.918 166.274 383.577 108.117C372.023 75.1719 350.918 47.9559 332.583 28.9525C321.888 17.7797 330.1 -0.65077 345.666 0.017691C439.824 4.21945 592.424 30.3849 657.265 193.108C685.722 264.537 687.823 338.355 674.263 413.413C665.668 461.352 635.11 567.923 704.821 581.006C754.573 590.365 778.638 550.83 789.429 522.373C793.917 510.531 809.483 507.571 817.886 517.025C901.921 612.615 909.084 725.203 891.704 822.13C858.09 1009.49 668.342 1145.86 479.836 1145.86C244.346 1145.86 56.8907 1011.11 8.28398 767.22C-11.2924 668.766 -1.36095 473.957 150.475 336.445C161.744 326.131 180.174 335.299 178.646 350.769Z" fill="url(#paint0_radial_3_5)" />
    <Path d="M565.876 701.138C479.071 589.41 517.938 461.925 539.233 411.122C542.098 404.437 534.458 398.134 528.442 402.241C491.104 427.642 414.613 487.422 378.993 571.552C330.768 685.286 334.206 740.96 362.759 808.952C379.948 849.919 359.99 858.609 349.963 860.137C340.222 861.665 331.246 855.171 324.084 848.391C303.48 828.61 288.797 803.478 281.684 775.815C280.156 769.894 272.421 768.271 268.888 773.141C242.15 810.098 228.303 869.4 227.634 911.322C225.534 1040.91 332.583 1145.95 462.073 1145.95C625.273 1145.95 744.164 965.467 650.389 814.586C623.173 770.658 597.58 741.914 565.876 701.138Z" fill="url(#paint1_radial_3_5)" />
  </Svg>
);

// Mitoアイコン（SVG）
const MitoIcon = ({ width, height }: { width: number, height: number }) => (
  <Svg width={width} height={height} viewBox="0 0 229 193" fill="none">
    {/* <Path d="M0 0 C75.57 0 151.14 0 229 0 C229 63.69 229 127.38 229 193 C153.43 193 77.86 193 0 193 C0 129.31 0 65.62 0 0 Z " fill="#FCFCFB" /> */}
    <Path d="M0 0 C3.43646983 0.2011015 4.8180592 0.8338413 7.38671875 3.1796875 C8.14597656 4.06914062 8.90523438 4.95859375 9.6875 5.875 C10.45449219 6.75929688 11.22148438 7.64359375 12.01171875 8.5546875 C14 11 14 11 16 14 C20.74425022 12.66187814 24.59152415 10.59061078 28.75390625 8.0234375 C31.36128099 6.83538153 33.16495379 6.73830343 36 7 C37.59770726 8.59770726 37.17060517 10.21751944 37.1875 12.4375 C37.13301518 20.67560457 36.00605533 28.83478311 35 37 C35.60585937 37.25652344 36.21171875 37.51304688 36.8359375 37.77734375 C51.21180305 44.34600847 61.45729259 56.31688321 67.7734375 70.62109375 C69.01212808 74.03341017 69.75862363 77.31294386 70.4375 80.875 C71.53491457 86.27169754 72.99767756 88.67386516 77.15234375 92.17578125 C80.76436794 95.74198695 82.77154394 100.4907416 85 105 C85.33 105.66 85.66 106.32 86 107 C86.51228015 112.60988749 86.76256033 117.44764504 84.25 122.5625 C79.36434109 127.85529716 79.36434109 127.85529716 74.90625 128.328125 C73.7821875 128.30234375 72.658125 128.2765625 71.5 128.25 C69.81390625 128.22679687 69.81390625 128.22679687 68.09375 128.203125 C65.56042012 128.03679526 63.41580507 127.73421527 61 127 C60.40251953 127.81404297 60.40251953 127.81404297 59.79296875 128.64453125 C59.26316406 129.35996094 58.73335937 130.07539063 58.1875 130.8125 C57.40439453 131.87404297 57.40439453 131.87404297 56.60546875 132.95703125 C55 135 55 135 53.359375 136.28125 C51.17451001 139.04372298 51.32636269 142.29215672 51.0625 145.6875 C50.28974899 153.38141228 48.96944363 159.52801 43 165 C38.35449472 167.67468486 33.20329993 167.65751528 28 167 C24.1609454 165.67742067 21.57082458 163.73654785 19.0625 160.5 C18 158 18 158 18 154 C17.06800781 154.24363281 17.06800781 154.24363281 16.1171875 154.4921875 C11.77643748 155.19932723 7.51525568 155.1442837 3.125 155.125 C2.25230469 155.12886719 1.37960938 155.13273438 0.48046875 155.13671875 C-4.4536442 155.12929903 -9.13613352 154.83494166 -14 154 C-14.20625 155.051875 -14.4125 156.10375 -14.625 157.1875 C-15.89241276 161.68271216 -18.21734555 163.37530099 -22 166 C-27.21773583 167.73924528 -32.16543322 167.69228935 -37.3125 165.75 C-43.31410373 161.84197897 -45.51253788 157.93116031 -47 151 C-47.08520352 149.02168069 -47.14673329 147.04223357 -47.1875 145.0625 C-47.58311578 137.87701348 -51.28605539 134.10000041 -56 129 C-56.495 128.01 -56.495 128.01 -57 127 C-57.52851562 127.15726562 -58.05703125 127.31453125 -58.6015625 127.4765625 C-64.05514537 128.66675811 -70.94768486 129.41049683 -76.11328125 127.0234375 C-79.74933523 124.08211344 -81.73247311 120.92056146 -82.37109375 116.3359375 C-82.63490475 104.5730706 -78.02134277 98.09231979 -70.72265625 89.29296875 C-68.46651923 86.28990202 -67.75876175 83.66734848 -67 80 C-62.6679649 64.77289663 -54.25577678 51.15409175 -41 42 C-37.72952494 40.18681015 -34.40345469 38.5476474 -31 37 C-31.06058594 36.40574219 -31.12117188 35.81148437 -31.18359375 35.19921875 C-31.45983621 32.46654334 -31.72995488 29.73329451 -32 27 C-32.09539062 26.06542969 -32.19078125 25.13085938 -32.2890625 24.16796875 C-32.81933264 18.75163799 -33.20158892 13.44290074 -33 8 C-32 7 -32 7 -29.84765625 6.7109375 C-24.95315078 7.20777345 -21.20480085 10.16195833 -17.05859375 12.6640625 C-14.21532722 14.25770342 -14.21532722 14.25770342 -11.890625 13.55859375 C-9.31932532 11.43886529 -7.37544152 9.05283248 -5.3125 6.4375 C-4.52488281 5.44621094 -3.73726563 4.45492188 -2.92578125 3.43359375 C-2.29027344 2.63050781 -1.65476562 1.82742188 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z" fill="#FCD117" transform="translate(106,12)" />
    <Path d="M0 0 C3.43646983 0.2011015 4.8180592 0.8338413 7.38671875 3.1796875 C8.14597656 4.06914062 8.90523438 4.95859375 9.6875 5.875 C10.45449219 6.75929688 11.22148438 7.64359375 12.01171875 8.5546875 C14 11 14 11 16 14 C20.74425022 12.66187814 24.59152415 10.59061078 28.75390625 8.0234375 C31.36128099 6.83538153 33.16495379 6.73830343 36 7 C37.59770726 8.59770726 37.17060517 10.21751944 37.1875 12.4375 C37.13301518 20.67560457 36.00605533 28.83478311 35 37 C35.60585937 37.25652344 36.21171875 37.51304688 36.8359375 37.77734375 C51.21180305 44.34600847 61.45729259 56.31688321 67.7734375 70.62109375 C69.01212808 74.03341017 69.75862363 77.31294386 70.4375 80.875 C71.53491457 86.27169754 72.99767756 88.67386516 77.15234375 92.17578125 C80.76436794 95.74198695 82.77154394 100.4907416 85 105 C85.33 105.66 85.66 106.32 86 107 C86.51228015 112.60988749 86.76256033 117.44764504 84.25 122.5625 C79.36434109 127.85529716 79.36434109 127.85529716 74.90625 128.328125 C73.7821875 128.30234375 72.658125 128.2765625 71.5 128.25 C69.81390625 128.22679687 69.81390625 128.22679687 68.09375 128.203125 C65.56042012 128.03679526 63.41580507 127.73421527 61 127 C60.40251953 127.81404297 60.40251953 127.81404297 59.79296875 128.64453125 C59.26316406 129.35996094 58.73335937 130.07539063 58.1875 130.8125 C57.40439453 131.87404297 57.40439453 131.87404297 56.60546875 132.95703125 C55 135 55 135 53.359375 136.28125 C51.17451001 139.04372298 51.32636269 142.29215672 51.0625 145.6875 C50.28974899 153.38141228 48.96944363 159.52801 43 165 C38.35449472 167.67468486 33.20329993 167.65751528 28 167 C24.1609454 165.67742067 21.57082458 163.73654785 19.0625 160.5 C18 158 18 158 18 154 C17.06800781 154.24363281 17.06800781 154.24363281 16.1171875 154.4921875 C11.77643748 155.19932723 7.51525568 155.1442837 3.125 155.125 C2.25230469 155.12886719 1.37960938 155.13273438 0.48046875 155.13671875 C-4.4536442 155.12929903 -9.13613352 154.83494166 -14 154 C-14.20625 155.051875 -14.4125 156.10375 -14.625 157.1875 C-15.89241276 161.68271216 -18.21734555 163.37530099 -22 166 C-27.21773583 167.73924528 -32.16543322 167.69228935 -37.3125 165.75 C-43.31410373 161.84197897 -45.51253788 157.93116031 -47 151 C-47.08520352 149.02168069 -47.14673329 147.04223357 -47.1875 145.0625 C-47.58311578 137.87701348 -51.28605539 134.10000041 -56 129 C-56.495 128.01 -56.495 128.01 -57 127 C-57.52851562 127.15726562 -58.05703125 127.31453125 -58.6015625 127.4765625 C-64.05514537 128.66675811 -70.94768486 129.41049683 -76.11328125 127.0234375 C-79.74933523 124.08211344 -81.73247311 120.92056146 -82.37109375 116.3359375 C-82.63490475 104.5730706 -78.02134277 98.09231979 -70.72265625 89.29296875 C-68.46651923 86.28990202 -67.75876175 83.66734848 -67 80 C-62.6679649 64.77289663 -54.25577678 51.15409175 -41 42 C-37.72952494 40.18681015 -34.40345469 38.5476474 -31 37 C-31.06058594 36.40574219 -31.12117188 35.81148437 -31.18359375 35.19921875 C-31.45983621 32.46654334 -31.72995488 29.73329451 -32 27 C-32.09539062 26.06542969 -32.19078125 25.13085938 -32.2890625 24.16796875 C-32.81933264 18.75163799 -33.20158892 13.44290074 -33 8 C-32 7 -32 7 -29.84765625 6.7109375 C-24.95315078 7.20777345 -21.20480085 10.16195833 -17.05859375 12.6640625 C-14.21532722 14.25770342 -14.21532722 14.25770342 -11.890625 13.55859375 C-9.31932532 11.43886529 -7.37544152 9.05283248 -5.3125 6.4375 C-4.52488281 5.44621094 -3.73726563 4.45492188 -2.92578125 3.43359375 C-2.29027344 2.63050781 -1.65476562 1.82742188 -1 1 C-0.67 0.67 -0.34 0.34 0 0 Z M-48.125 56.125 C-54.39594005 63.4369161 -61 73.73614113 -61 83.625 C-61.49661784 88.70802969 -64.96686887 91.90404189 -68.19311523 95.56787109 C-73.68626267 101.82282743 -77 107.55390695 -77 116 C-75.51525187 118.72203824 -74.18455806 120.81544194 -72 123 C-66.12353969 123.46331437 -66.12353969 123.46331437 -61 121 C-61.144375 120.154375 -61.28875 119.30875 -61.4375 118.4375 C-62.0058797 114.96406851 -62.51202393 111.48554338 -63 108 C-61.02 107.505 -61.02 107.505 -59 107 C-58.90847656 107.83917969 -58.81695312 108.67835937 -58.72265625 109.54296875 C-57.89258847 113.51383352 -56.35702288 116.78079484 -54.4375 120.3125 C-54.08179932 120.97040527 -53.72609863 121.62831055 -53.35961914 122.30615234 C-46.29893034 134.94859139 -36.7447754 142.56870929 -23 147 C-2.92316995 151.76436916 21.47291173 151.12340436 39.84375 141.07421875 C51.02055014 133.72906915 59.96291458 122.16070347 63 109 C63 108.34 63 107.68 63 107 C64.65 107 66.3 107 68 107 C67.7834375 107.67546875 67.566875 108.3509375 67.34375 109.046875 C67.0653125 109.93890625 66.786875 110.8309375 66.5 111.75 C66.2215625 112.63171875 65.943125 113.5134375 65.65625 114.421875 C64.83554715 117.20267529 64.83554715 117.20267529 65 121 C68.75047482 123.50031654 70.55856266 123.53603554 75 123 C78.44775886 120.52660778 79.74480348 118.78060113 81.0625 114.75 C80.92682726 106.60963543 76.19436805 99.99555593 71 94 C70.0925 93.236875 69.185 92.47375 68.25 91.6875 C65.33969942 88.21130764 65.22018654 85.42876341 64.5703125 81.02734375 C61.74940211 66.05333312 51.89729867 54.37483539 39.9921875 45.50390625 C28.52580651 38.15757471 14.28474459 38.72241827 1.1875 38.6875 C0.52055115 38.68382416 -0.14639771 38.68014832 -0.83355713 38.67636108 C-19.96853051 38.62141099 -34.62621838 41.97723849 -48.125 56.125 Z" fill="#2E3B4A" transform="translate(106,12)" />
    <Path d="M0 0 C10.56 0 21.12 0 32 0 C32.99 2.97 33.98 5.94 35 9 C40.93964645 11.96982322 45.44811833 12.5715037 52 12 C56.22467804 10.46375344 58.69648049 8.8796118 61 5 C61.33 4.01 61.66 3.02 62 2 C68.92695311 -1.03558785 79.4108056 2.90388447 86.29296875 5.0234375 C88.51152694 6.29263555 89.06474056 7.66904572 90 10 C85.52586381 13.35560214 82.12076999 14.69195218 76.5 15.625 C75.79496338 15.74343262 75.08992676 15.86186523 74.36352539 15.98388672 C72.92202234 16.22270604 71.47937232 16.45470795 70.03564453 16.6796875 C68.23765012 16.96260531 66.44449083 17.27588961 64.65234375 17.59375 C33.0217353 22.82067922 -2.399192 21.61069006 -34.0625 17.1875 C-35.19341064 17.03442383 -36.32432129 16.88134766 -37.48950195 16.72363281 C-44.46396365 15.67996938 -50.59085725 13.95216114 -57 11 C-57 9.68 -57 8.36 -57 7 C-49.88271679 1.21720739 -39.70025176 1.503978 -31 1 C-30.608125 1.9075 -30.21625 2.815 -29.8125 3.75 C-27.35995786 8.14766177 -24.77292642 10.40902453 -20 12 C-14.29594285 12.56497328 -9.89576602 12.26384401 -5 9 C-2.28899983 6.09535696 -1.54720359 3.86800897 0 0 Z" fill="#E2E6EE" transform="translate(92,166)" />
    <Path d="M0 0 C0.66 0 1.32 0 2 0 C3.58533702 1.71332754 5.09541215 3.49689047 6.5625 5.3125 C7.36816406 6.29863281 8.17382812 7.28476562 9.00390625 8.30078125 C11 11 11 11 12 14 C17.26118296 12.87260365 21.61131469 11.38346569 26.3359375 8.8046875 C28 8 28 8 30 8 C29.34 14.6 28.68 21.2 28 28 C25.69 27.67 23.38 27.34 21 27 C19.5138169 26.91996314 18.02520095 26.87230991 16.53686523 26.87060547 C15.73590927 26.86745331 14.93495331 26.86430115 14.10972595 26.86105347 C12.84691551 26.86408981 12.84691551 26.86408981 11.55859375 26.8671875 C10.67269058 26.86623077 9.78678741 26.86527405 8.8740387 26.86428833 C7.01083301 26.86361106 5.14762491 26.8654336 3.28442383 26.86962891 C0.44281696 26.87498997 -2.39863233 26.86966522 -5.24023438 26.86328125 C-7.05729201 26.86394199 -8.87434955 26.86522306 -10.69140625 26.8671875 C-11.53530411 26.86516327 -12.37920197 26.86313904 -13.24867249 26.86105347 C-17.61219324 26.87829394 -21.70325644 27.12633604 -26 28 C-26.33868777 25.79248152 -26.67071689 23.58394089 -27 21.375 C-27.185625 20.14523438 -27.37125 18.91546875 -27.5625 17.6484375 C-27.95402516 14.3833973 -28.08080924 11.28287549 -28 8 C-24.80369954 8.9893311 -21.94922401 10.02750366 -19 11.625 C-15.50935058 13.22488098 -13.79603249 13.59490061 -10 13 C-7.94262766 10.83559673 -6.39396456 8.94057701 -4.75 6.5 C-3.20768136 4.29209742 -1.63593921 2.14202113 0 0 Z" fill="#F6CE18" transform="translate(107,19)" />
    <Path d="M0 0 C2.47189851 1.94220597 2.97912836 2.93738507 4 6 C4.26841061 10.16036444 4.3152334 13.05429979 3 17 C0.33975526 19.66024474 -1.41935978 19.55950636 -5.0625 19.56640625 C-7.84851567 18.75194602 -8.59958546 17.50012657 -10 15 C-10.7665884 10.37792288 -10.54460725 6.21298887 -8.625 1.9375 C-5.80296125 -1.42723851 -4.05932741 -1.18809583 0 0 Z" fill="#2A3848" transform="translate(137,80)" />
    <Path d="M0 0 C2.47189851 1.94220597 2.97912836 2.93738507 4 6 C4.26841061 10.16036444 4.3152334 13.05429979 3 17 C0.74148664 19.25851336 0.07960852 19.40988029 -3 19.625 C-6.03676812 19.40729052 -6.74298874 19.24897966 -9 17.0625 C-10.71624777 11.80649121 -10.95033992 7.07346891 -8.625 2 C-5.83220572 -1.43728527 -4.08786712 -1.19644891 0 0 Z" fill="#2A3748" transform="translate(85,80)" />
    <Path d="M0 0 C-0.34848213 9.94916472 -0.34848213 9.94916472 -2.9375 14.125 C-6.60375939 17.45796308 -9.69506026 17.44669294 -14.51171875 17.42578125 C-17.37403401 16.93599732 -18.27536618 16.31577666 -20.125 14.125 C-22 11 -22 11 -22 9 C-21.23816406 8.76925781 -20.47632813 8.53851563 -19.69140625 8.30078125 C-13.60568587 6.37857494 -8.12663959 4.23251233 -2.64453125 0.953125 C-1 0 -1 0 0 0 Z" fill="#EFCB1A" transform="translate(151,156)" />
    <Path d="M0 0 C0.76183594 0.39832031 1.52367188 0.79664063 2.30859375 1.20703125 C8.45053996 4.35851676 14.38728161 7.01618448 21 9 C19.375 14.75 19.375 14.75 16 17 C11.52139377 17.64300524 7.39630691 17.87269182 3.5 15.4375 C0.42075657 10.43372943 -0.09733426 5.75894387 0 0 Z" fill="#F0CC1A" transform="translate(65,156)" />
    <Path d="M0 0 C1.32 0 2.64 0 4 0 C4.86625 1.2375 4.86625 1.2375 5.75 2.5 C7.66722428 5.12277846 7.66722428 5.12277846 9.890625 5.40234375 C13.64150159 5.46485836 16.88643301 5.27529895 20 3 C20.66 2.01 21.32 1.02 22 0 C23.32 0.33 24.64 0.66 26 1 C25.51999859 5.32001266 24.38496591 7.27322191 21 10 C16.93235628 12.51236818 13.04157388 12.19191009 8.44921875 11.6015625 C4.41093636 10.60970367 2.6911656 9.18690663 0 6 C-0.375 2.6875 -0.375 2.6875 0 0 Z" fill="#333F46" transform="translate(95,96)" />
  </Svg>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3F414E',
  },
  fastingInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    width: '100%',
  },
  timerCircle: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleWrapper: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    alignSelf: 'center',
  },
  timerTextOverlay: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  timer: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#070417',
    marginBottom: 0,
  },
  fastingLabel: {
    fontSize: 28,
    color: '#3F414E',
    marginBottom: 8,
  },
  endTime: {
    fontSize: 16,
    color: '#A0A3B1',
  },
  endFastingButton: {
    backgroundColor: '#8E97FD',
    borderRadius: 38,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 32,
  },
  endFastingText: {
    color: '#F6F1FB',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  stepSection: {
    marginTop: 48,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#54575C',
    shadowOffset: { width: 2, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 17,
    elevation: 4,
  },
  circlesContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9E9FF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8E97FD',
    zIndex: 2,
  },
  goalText: {
    fontSize: 12,
    color: '#877777',
    textAlign: 'right',
    flex: 1,
  },
  stepsText: {
    fontSize: 12,
    color: '#877777',
    textAlign: 'left',
    flex: 1,
  },
  stepCounter: {
    fontSize: 16,
    color: '#A0A3B1',
    textAlign: 'center',
    marginTop: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 24,
    backgroundColor: '#D9D1C2',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '80%', // 仮の進捗
    height: 24,
    backgroundColor: '#FE866C',
    borderRadius: 12,
  },
  bottomCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9E9FF',
    alignSelf: 'center',
    marginTop: -40,
    zIndex: -1,
  },
  footerMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingVertical: 8,
    shadowColor: '#54575C',
    shadowOffset: { width: 2, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 17,
    elevation: 8,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    fontSize: 24,
    color: '#A0A3B1',
    marginBottom: 2,
  },
  footerLabel: {
    fontSize: 14,
    color: '#A0A3B1',
  },
});

export default TopScreen; 