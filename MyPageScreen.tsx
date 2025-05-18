import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyPageScreen = ({ onEdit, onLoginRequest }: { onEdit?: () => void; onLoginRequest?: () => void }) => {
  const [user, setUser] = useState(auth().currentUser);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  // 今週の日付配列（YYYY-MM-DD）
  const getThisWeekDateStrings = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  };
  const thisWeekDateStrings = getThisWeekDateStrings();

  // fastingRecordsをFirestore/AsyncStorageから取得
  useEffect(() => {
    if (user) {
      const ref = firestore()
        .collection('users')
        .doc(user.uid)
        .collection('fastingRecords')
        .where('date', 'in', thisWeekDateStrings)
        .get()
        .then(snapshot => {
          const recs = snapshot.docs.map(doc => doc.data());
          setRecords(recs);
        });
    } else {
      (async () => {
        const key = 'fastingRecords';
        const prev = await AsyncStorage.getItem(key);
        let recs = [];
        if (prev) {
          recs = JSON.parse(prev);
        }
        // 今週分だけ抽出
        setRecords(recs.filter((r: any) => thisWeekDateStrings.includes(r.date)));
      })();
    }
  }, [user]);

  // 各日付ごとにelapsedSeconds最大値を1時間単位で配列化
  const fastingBarData = thisWeekDateStrings.map(dateStr => {
    const dayRecords = records.filter(r => r.date === dateStr && r.type === 'end' && r.elapsedSeconds);
    if (dayRecords.length === 0) return 0;
    const maxElapsed = Math.max(...dayRecords.map(r => r.elapsedSeconds));
    return Math.floor(maxElapsed / 3600);
  });

  const getThisWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0:日, 1:月, ...
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d.getDate();
    });
  };
  const thisWeekDates = getThisWeekDates();

  // Total fasts: 16h(=57600秒)以上のendレコード数
  const totalFasts = records.filter(r => r.type === 'end' && r.elapsedSeconds >= 16 * 3600 && thisWeekDateStrings.includes(r.date)).length;

  return (
    <ScrollView style={styles.container}>
      {/* プロフィール */}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.profileSection}
        onPress={() => {
          if (user) {
            Alert.alert(
              'ログアウト',
              'ログアウトしますか？',
              [
                { text: 'キャンセル', style: 'cancel' },
                { text: 'OK', onPress: () => auth().signOut() },
              ]
            );
          }
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.profileImage} />
          {user ? (
            <Text style={styles.playerName}>{user.displayName || 'No Name'}</Text>
          ) : (
            <TouchableOpacity onPress={onLoginRequest}>
              <Text style={styles.playerName}>ログインしてください</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Fasting records */}
      <RecordSection
        title="Fasting records"
        date="This week"
        barData={fastingBarData}
        barColor="#E53E42"
        summary={[
          { label: 'Total rewards', value: totalFasts.toString(), unit: '回' },
          { label: 'Longest fast', value: String(Math.max(...fastingBarData)), unit: 'h' },
        ]}
        weekDates={thisWeekDates}
      />

      {/* Walking records */}
      <RecordSection
        title="Walking records"
        date="This week"
        barData={[8, 9, 12, 15, 7, 10, 11]}
        barColor="#8E97FD"
        summary={[
          { label: 'Average', value: '7956', unit: 'steps' },
          { label: 'Best', value: '15311', unit: 'steps' },
        ]}
        weekDates={thisWeekDates}
      />
    </ScrollView>
  );
};

// RecordSectionの下に凡例セクションを追加
const LegendSection = ({ barColor }: { barColor: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginLeft: 16 }}>
    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: barColor, marginRight: 8 }} />
    <Text style={{ marginRight: 16, color: '#3F414E', fontSize: 14 }}>Achievement</Text>
    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#D9D1C2', marginRight: 8 }} />
    <Text style={{ color: '#3F414E', fontSize: 14 }}>Unachieved</Text>
  </View>
);

// RecordSectionで棒グラフの長さをランダムにし、一定より短いものはUnachieved色に
const RecordSection = ({ title, date, barData, barColor, summary, weekDates }: any) => {
  // 棒グラフの高さをbarDataの週ごとの最大値でスケーリング
  const maxValue = Math.max(...barData);
  const barMaxHeight = 180;
  const heights = barData.map((v: number) => Math.round((v / maxValue) * barMaxHeight));
  let threshold = 80; // デフォルト閾値
  if (title === 'Fasting records') {
    threshold = 16; // Fastingは16未満でUnachieved色
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      {/* サマリー */}
      <View style={styles.summaryRow}>
        {summary.map((s: any, i: number) => (
          <View key={i} style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{s.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={styles.summaryValue}>{s.value}</Text>
              <Text style={styles.summaryUnit}>{s.unit}</Text>
            </View>
          </View>
        ))}
      </View>
      {/* 凡例 */}
      <LegendSection barColor={barColor} />
      {/* 棒グラフ */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 16 }}>
        <View style={styles.barGraphRow}>
          {heights.map((height: number, i: number) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height,
                  backgroundColor:
                    title === 'Fasting records'
                      ? (barData[i] < 16 ? '#D9D1C2' : barColor)
                      : (height < 80 ? '#D9D1C2' : barColor),
                },
              ]}
            />
          ))}
        </View>
        {/* 右側の軸ラベルを画面右端に寄せる */}
        <View style={{ flex: 1, alignItems: 'flex-end', height: 180, justifyContent: 'space-between' }}>
          {title === 'Walking records' ? (
            <>
              <Text style={{ fontSize: 12, color: '#877777' }}>{Math.round(maxValue / 1000)}k</Text>
              <Text style={{ fontSize: 12, color: '#877777' }}>{Math.round((maxValue / 2) / 1000)}k</Text>
              <Text style={{ fontSize: 12, color: '#877777' }}>0</Text>
            </>
          ) : title === 'Fasting records' ? (
            <>
              <Text style={{ fontSize: 12, color: '#877777' }}>{maxValue}h</Text>
              <Text style={{ fontSize: 12, color: '#877777' }}>{Math.round(maxValue / 2)}h</Text>
              <Text style={{ fontSize: 12, color: '#877777' }}>0</Text>
            </>
          ) : null}
        </View>
      </View>
      {/* 日付ラベル（日付のみ表示） */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginHorizontal: 2, paddingRight: 32 }}>
        {weekDates.map((date: number, i: number) => (
          <Text key={i} style={{ width: 24, textAlign: 'center', fontSize: 12, color: '#877777' }}>{date}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileSection: { alignItems: 'flex-start', marginTop: 32, marginBottom: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0E8DC', marginBottom: 8 },
  playerName: { fontSize: 28, color: '#3F414E', fontWeight: 'bold', marginLeft: 26 },
  section: { marginVertical: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 28, color: '#3F414E', fontWeight: 'bold', textAlign: 'left', marginBottom: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 , marginTop: 8},
  dateText: { fontSize: 16, color: '#321C1C' },
  barGraphRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, marginBottom: 8, gap: 25 },
  bar: { width: 32, borderRadius: 16, marginHorizontal: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 16 },
  summaryCard: { alignItems: 'center', padding: 8, borderRadius: 12, minWidth: 160 },
  summaryLabel: { fontSize: 15, color: '#877777' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#3F414E' },
  summaryUnit: { fontSize: 12, color: '#877777', marginLeft: 4, lineHeight: 22 },
});

export default MyPageScreen; 