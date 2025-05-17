import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const HomeIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
    <Path d="M20.3204 7.50594L12.7282 0.819133C11.6436 -0.265457 9.87783 -0.265456 8.83806 0.774315L1.1563 7.55076C0.412323 8.29473 0 9.28969 0 10.3474V19.302C0 20.7899 1.21008 22 2.69803 22H18.8324C20.3114 22 21.5215 20.7899 21.5215 19.302V10.3474C21.5215 9.28969 21.1092 8.29473 20.3204 7.50594ZM19.7288 19.302C19.7288 19.8039 19.3254 20.2073 18.8324 20.2073H13.1495V14.4348C13.1495 13.9149 12.7372 13.5026 12.2173 13.5026H9.30416C8.79324 13.5026 8.37195 13.9149 8.37195 14.4348V20.2073H2.69803C2.19607 20.2073 1.79271 19.8039 1.79271 19.302V10.3474C1.79271 9.78268 2.02576 9.21798 2.3843 8.85047L10.0661 2.08299C10.2543 1.89476 10.4963 1.79616 10.7473 1.79616C11.0162 1.79616 11.2851 1.90372 11.5002 2.11885L19.0924 8.81462C19.5047 9.22694 19.7288 9.77372 19.7288 10.3474V19.302Z" fill="#A0A3B1"/>
  </Svg>
);

const GroupIcon = () => (
  <Svg width={20} height={24} viewBox="0 0 20 24" fill="none">
    <Path d="M10.0001 0.900391C12.983 0.900391 15.4081 3.32269 15.4083 6.30371C15.4083 9.28474 12.9833 11.7158 10.0001 11.7158C7.01714 11.7158 4.59297 9.2926 4.59286 6.31152C4.59286 3.32323 7.01699 0.900445 10.0001 0.900391ZM10.0001 2.54102C7.92093 2.54107 6.23469 4.23313 6.23447 6.30371C6.23447 8.37436 7.92789 10.0673 10.0001 10.0674C12.0723 10.0674 13.7657 8.37439 13.7657 6.30371C13.7655 4.2331 12.0793 2.54102 10.0001 2.54102Z" fill="#A0A3B1" stroke="#98A1BD" stroke-width="0.2"/>
    <Path d="M15.0235 24.0001H4.97652C2.37695 24.0001 0.269196 21.6235 0.269196 18.6924C0.269196 15.7612 2.38574 13.3846 4.97652 13.3846H15.0235C17.6231 13.3846 19.7308 15.7711 19.7308 18.6924C19.7308 21.6136 17.6231 24.0001 15.0235 24.0001ZM4.97652 15.3651C3.35179 15.3651 2.02566 16.8604 2.02566 18.6924C2.02566 20.5243 3.35179 22.0196 4.97652 22.0196H15.0235C16.6482 22.0196 17.9744 20.5243 17.9744 18.6924C17.9744 16.8604 16.6482 15.3651 15.0235 15.3651H4.97652Z" fill="#A0A3B1"/>
  </Svg>
);

// props型を追加
interface FooterMenuProps {
  onPressToday: () => void;
  onPressMyPage: () => void;
}

const FooterMenu = ({ onPressToday, onPressMyPage }: FooterMenuProps) => (
  <View style={styles.footerMenu}>
    <TouchableOpacity style={styles.footerItem} onPress={onPressToday}>
      <HomeIcon />
      <Text style={styles.footerLabel}>Today</Text>
    </TouchableOpacity>
    <View style={styles.footerItem}>
      <Text style={styles.footerIcon}>●</Text>
      <Text style={styles.footerLabel}>Mito</Text>
    </View>
    <TouchableOpacity style={styles.footerItem} onPress={() => {
      onPressMyPage();
    }}>
      <GroupIcon />
      <Text style={styles.footerLabel}>My Page</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  footerMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    paddingVertical: 16,
    paddingBottom: 24,
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

export default FooterMenu; 