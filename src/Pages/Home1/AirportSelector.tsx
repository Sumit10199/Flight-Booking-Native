import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Keyboard,
} from 'react-native';
import { GlobalResponseType, postData } from '../../utils/axios';
import { endpoints } from '../../utils/endpoints';

export interface Airport {
  id: number;
  airport_name: string;
  airport_code: string;
  airport_city: string;
  country_name: string;
  country_id: number;
  airport_type: 'i' | 'd';
  status: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const AirportSelector = ({
  label,
  value,
  onChange,
  icon,
}: {
  label: string;
  value: string;
  onChange: (text: string) => void;
  icon: any;
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [airportData, setAirportData] = useState<Airport[]>([]);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    getAirPort();
  }, []);

  const getAirPort = async () => {
    try {
      const response: GlobalResponseType<{
        status: boolean;
        message: string;
        result: Airport[];
      }> = await postData({
        url: endpoints.AIRPORT_GET,
        body: {},
      });

      if (response.status === 200 && response.data.status) {
        setAirportData(response.data.result);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAirports = airportData.filter(item => {
    const q = searchText.toLowerCase();
    return (
      item.airport_name.toLowerCase().includes(q) ||
      item.airport_code.toLowerCase().includes(q) ||
      item.airport_city.toLowerCase().includes(q)
    );
  });

  const handleSelectAirport = (airportCode: string) => {
    onChange(airportCode);
    setSearchText('');
    setShowDropdown(false);
    Keyboard.dismiss();
  };

  return (
    <View style={{ width: '100%', position: 'relative' }}>
      <Text style={styles.sectionLabel}>{label}</Text>

      <View style={styles.inputCard}>
        <Image source={icon} />
        <View style={styles.inputColumn}>
          <TextInput
            ref={inputRef}
            style={styles.inputTitle}
            placeholder="Search for an airport..."
            placeholderTextColor="#aaa"
            value={value || searchText}
            onFocus={() => setShowDropdown(true)}
            onChangeText={t => {
              setSearchText(t);
              onChange(t);
              setShowDropdown(true);
            }}
          />
        </View>
      </View>

      {showDropdown && searchText.length > 0 && (
        <View style={[styles.dropdown, { top:100, zIndex: 999 }]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredAirports.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.option}
                onPress={() => handleSelectAirport(item.airport_code)}
              >
                <Text style={styles.code}>
                  {item.airport_code} - {item.airport_city}
                </Text>
                <Text style={styles.name}>{item.airport_name}</Text>
              </TouchableOpacity>
            ))}
            {filteredAirports.length === 0 && (
              <Text style={[styles.option, { color: '#777' }]}>No results found</Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AirportSelector;

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    color:"black"
  },
  inputColumn: {
    marginLeft: 10,
    flex: 1,
  },
  inputTitle: {
    width: '100%',
    fontSize: 16,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    width: '100%',
    maxHeight: 250,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  code: {
    fontWeight: '700',
    fontSize: 15,
  },
  name: {
    fontSize: 13,
    color: '#777',
  },
});
