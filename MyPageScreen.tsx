import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const MyPageScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* プロフィール */}
      <View style={styles.profileSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.profileImage} />
          <Text style={styles.playerName}>Player name</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Fasting records */}
      <RecordSection
        title="Fasting records"
        date="April"
        barData={[8, 18, 16, 14, 17, 16, 13]}
        barColor="#E53E42"
        summary={[
          { label: 'Total fasts', value: '62', unit: 'hours' },
          { label: 'Streak days', value: '3', unit: 'days' },
        ]}
      />

      {/* Walking records */}
      <RecordSection
        title="Walking records"
        date="April"
        barData={[8000, 9500, 12000, 15311, 7956, 10000, 11000]}
        barColor="#8E97FD"
        summary={[
          { label: 'Average', value: '7956', unit: 'steps' },
          { label: 'Best', value: '15311', unit: 'steps' },
        ]}
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
const RecordSection = ({ title, date, barData, barColor, summary }: any) => {
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
        {barData.map((_: any, i: number) => (
          <Text key={i} style={{ width: 12, textAlign: 'center', fontSize: 12, color: '#877777' }}>{i + 1}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  profileSection: { alignItems: 'center', marginTop: 32, marginBottom: 16 },
  profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0E8DC', marginBottom: 8 },
  playerName: { fontSize: 28, color: '#3F414E', fontWeight: 'bold', marginLeft: 26 },
  editButton: { backgroundColor: '#EBEAEC', borderRadius: 25, paddingHorizontal: 32, paddingVertical: 8, marginTop: 8 },
  editText: { color: '#3F414E', fontSize: 12, letterSpacing: 1 },
  section: { marginVertical: 28, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 28, color: '#3F414E', fontWeight: 'bold', textAlign: 'left', marginBottom: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8 , marginTop: 8},
  dateText: { fontSize: 16, color: '#321C1C' },
  barGraphRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, marginBottom: 8, gap: 43 },
  bar: { width: 16, borderRadius: 8, marginHorizontal: 0 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 16 },
  summaryCard: { alignItems: 'center', padding: 8, borderRadius: 12, minWidth: 160 },
  summaryLabel: { fontSize: 15, color: '#877777' },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#3F414E' },
  summaryUnit: { fontSize: 12, color: '#877777', marginLeft: 4, lineHeight: 22 },
});

export default MyPageScreen; 