import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";

const Flight_List = () => {
  const flights = [
    {
      id: 1,
      airline: require("../../../assets/Group 41.png"),
      name: "Indigo",
      flightNo: "IN 230",
      date: "25-Mar-2023",
      depTime: "5.50",
      depCity: "DEL (Delhi)",
      arrTime: "7.30",
      arrCity: "CCU (Kolkata)",
      seats: 1,
      fare: 5230,
      status: "Book Now",
    },
    {
      id: 2,
      airline: require("../../../assets/Group 43.png"),
      name: "Delta",
      flightNo: "IN 230",
      date: "25-Mar-2023",
      depTime: "4.30",
      depCity: "DEL (Delhi)",
      arrTime: "6.30",
      arrCity: "CCU (Kolkata)",
      seats: 1,
      fare: 5230,
      status: "Offline",
    },
    {
      id: 3,
      airline: require("../../../assets/Group 43.png"),
      name: "Air India",
      flightNo: "IN 230",
      date: "25-Mar-2023",
      depTime: "2.20",
      depCity: "DEL (Delhi)",
      arrTime: "3.30",
      arrCity: "CCU (Kolkata)",
      seats: 1,
      fare: 5230,
      status: "Book Now",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {flights.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={item.airline} style={styles.airlineLogo} />
              <Text style={styles.flightNo}>{item.flightNo}</Text>
            </View>

            <Text style={styles.date}>{item.date}</Text>
          </View>

          {/* Time Row */}
          <View style={styles.timeRow}>
            <View>
              <Text style={styles.time}>{item.depTime}</Text>
              <Text style={styles.city}>{item.depCity}</Text>
            </View>

            <Image
              source={require("../../../assets/Group 44.png")}
              style={styles.middleIcon}
            />

            <View>
              <Text style={styles.time}>{item.arrTime}</Text>
              <Text style={styles.city}>{item.arrCity}</Text>
            </View>
          </View>

          {/* Seats & Fare */}
          <View style={styles.detailRow}>
            <Text>Seats: {item.seats}</Text>
            <Text>Fare: {item.fare}</Text>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[
              styles.button,
              item.status === "Offline" && { backgroundColor: "#999" },
            ]}
          >
            <Text style={styles.buttonText}>{item.status}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default Flight_List;

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    borderWidth: 2,
    borderColor: "#00AEEF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  airlineLogo: {
    width: 40,
    height: 20,
    resizeMode: "contain",
    marginRight: 6,
  },
  flightNo: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    color: "#555",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  time: {
    fontSize: 20,
    fontWeight: "700",
  },
  city: {
    fontSize: 12,
    color: "#666",
  },
  middleIcon: {
    width: 40,
    height: 20,
    resizeMode: "contain",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#ff8800",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
