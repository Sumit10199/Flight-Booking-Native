import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { postData } from "../../utils/axios";
import { endpoints } from "../../utils/endpoints";
import Header from "../../Components/Header/Header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CancellationRequest() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPendingCancelRequest = async () => {
    setIsLoading(true);
    try {
      const response = await postData({
        url: endpoints.GET_PENDING_CANCEL_REQUEST,
        body: { page: 1, limit: 100 },
      });

      console.log("API DATA ===>", response.data);

      if (response.status === 200 && response.data?.result) {
        setData(response.data.result);
      } else {
        setData([]);
      }
    } catch (err) {
      console.log("API ERROR:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPendingCancelRequest();
  }, []);

  const StatusChip = ({ status }:{status:string}) => {
    let bg = "#ffeeba";
    let color = "#b08900";

    if (status === "APPROVED") {
      bg = "#d4edda";
      color = "#155724";
    } else if (status === "REJECTED") {
      bg = "#f8d7da";
      color = "#721c24";
    }

    return (
      <View style={[styles.chip, { backgroundColor: bg }]}>
        <Text style={{ color, fontWeight: "600", fontSize: 12 }}>{status}</Text>
      </View>
    );
  };

  const renderCard = ({ item }:{item:any}) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.label}>PNR No:</Text>
        <Text style={styles.value}>{item.pnr_no}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Status:</Text>
        <StatusChip status={item.status} />
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{item.booking_email}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Phone:</Text>
        <Text style={styles.value}>{item.booking_phone}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Price:</Text>
        <Text style={styles.value}>
          ₹ {new Intl.NumberFormat("en-IN").format(item.price)}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Passenger Name:</Text>
        <Text style={styles.value}>{item.pax_name}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Passenger Type:</Text>
        <Text style={styles.value}>{item.pax_type}</Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Request Date:</Text>
        <Text style={styles.value}>
          {new Date(item.created_at).toLocaleString("en-GB")}
        </Text>
      </View>

      <View style={styles.cardRow}>
        <Text style={styles.label}>Approved Date:</Text>
        <Text style={styles.value}>
          {item.updated_at
            ? new Date(item.updated_at).toLocaleString("en-GB")
            : "--"}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Booking Cancellation Requests" />

      <View style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0a7" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.request_id.toString()}
            renderItem={renderCard}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f9f9f9" },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: { fontWeight: "700", fontSize: 14, color: "#444" },

  value: { fontSize: 14, color: "#333", maxWidth: "60%", textAlign: "right" },

  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
});
