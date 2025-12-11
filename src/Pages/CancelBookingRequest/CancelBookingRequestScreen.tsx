// src/screens/cancel_booking/CancelBookingFlightScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert as RNAlert,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

import Header from "../../Components/Header/Header"; 
import { RootState } from "../../store/store";
import { postData, GlobalResponseType } from "../../utils/axios";
import { endpoints } from "../../utils/endpoints";

type Passenger = {
  booking_detail_id: number | string;
  pax_title: string;
  pax_first_name: string;
  pax_last_name: string;
  pax_type: string; // "adult" | "child" | "infant" | etc.
};

export default function CancelBookingFlightScreen() {
  const navigation = useNavigation<any>();

  const booking = useSelector((state: RootState) => state.editBooking.booking);
  const [loader, setLoader] = useState(false);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [charges, setCharges] = useState<{ nameChange?: string; cancellation?: string }>({});

  // Build list excluding those already cancelled
  const visiblePassengers: Passenger[] = useMemo(() => {
    const cancelIds = booking?.cancel_requests ?? [];
    const pax = booking?.passengers ?? [];
    return pax.filter((p: any) => {
      const isCanceled = cancelIds?.some(
        (cr: any) => String(cr.booking_detail_id) === String(p.booking_detail_id)
      );
      return !isCanceled;
    });
  }, [booking]);

  // Selection state: id -> boolean
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    const init: Record<string | number, boolean> = {};
    visiblePassengers.forEach((p) => (init[p.booking_detail_id] = false));
    setSelected(init);
  }, [visiblePassengers]);

  // Fetch charges (name change + cancellation)
  const getChangeRequestCharges = useCallback(async () => {
    try {
      setChargesLoading(true);
      const response: GlobalResponseType<{ message: string; status: boolean; result: any[] }> =
        await postData({
          url: endpoints.GET_AGENT_CHANGE_REQUEST_CHARGES,
          body: {},
        });

      if (response.status === 200 && response.data.status) {
        const resData = response.data.result || [];
        const nameChange = resData.find((i: any) => i.request_type === "name_change")?.charges;
        const cancellation = resData.find((i: any) => i.request_type === "booking_cancellation")
          ?.charges;

        setCharges({
          nameChange,
          cancellation,
        });
      }
    } catch (error) {
      // silent fail -> show toast
      Toast.show({
        type: "error",
        text1: "Failed to load charges",
        text2: "Please try again.",
      });
    } finally {
      setChargesLoading(false);
    }
  }, []);

  useEffect(() => {
    getChangeRequestCharges();
  }, [getChangeRequestCharges]);

  const onSubmit = useCallback(async () => {
    const pickedIds = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (pickedIds.length === 0) {
      Toast.show({
        type: "info",
        text1: "Select passengers",
        text2: "Please select at least one passenger before submitting.",
      });
      return;
    }

    setLoader(true);
    try {
      const response: GlobalResponseType<{ status: boolean; message: string }> = await postData({
        url: endpoints.AGENT_BOOKING_CANCEL_REQUEST,
        body: {
          booking_id: booking?.id,
          agent_id: booking?.agent_id,
          pax_id: pickedIds,
        },
      });

      if (response.status === 200 && response.data.status) {
        Toast.show({ type: "success", text1: "Success", text2: response.data.message });
        navigation.navigate("Booking");
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: response?.data?.message || "Something went wrong.",
        });
      }
    } catch (error) {
      RNAlert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoader(false);
    }
  }, [selected, booking, navigation]);

  const renderPassenger = ({ item: p }: { item: Passenger }) => {
    const id = p.booking_detail_id;
    const isOn = !!selected[id];

    return (
      <View style={s.paxCard}>
        <View style={s.paxRow}>
          <Switch
            value={isOn}
            onValueChange={(v) => setSelected((prev) => ({ ...prev, [id]: v }))}
          />
          <Text style={s.paxSummary}>
            {`${p.pax_title} ${p.pax_first_name} ${p.pax_last_name}`} – {p.pax_type}
          </Text>
        </View>
      </View>
    );
  };

  const hasAnySelection = useMemo(
    () => Object.values(selected).some(Boolean),
    [selected]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header title="Ticket Cancel Request" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <FlatList
          ListHeaderComponent={
            <View style={s.container}>
              {/* LEFT CARD: Passenger selection */}
              <View style={s.card}>
                <Text style={s.title}>Ticket Cancel Request</Text>
                <Text style={s.subtitle}>Select passengers if required</Text>

                <FlatList
                  data={visiblePassengers}
                  keyExtractor={(x) => String(x.booking_detail_id)}
                  renderItem={renderPassenger}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                  ListEmptyComponent={
                    <Text style={{ color: "#6b7280" }}>
                      No passengers available for cancellation.
                    </Text>
                  }
                />

                <View style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    style={[s.submitBtn, (loader || !hasAnySelection) && { opacity: 0.7 }]}
                    onPress={onSubmit}
                    disabled={loader || !hasAnySelection}
                  >
                    {loader ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Submit Request</Text>}
                  </TouchableOpacity>
                </View>
              </View>

              {/* RIGHT CARD: Flight Details */}
              <View style={s.card}>
                <Text style={s.cardHeader}>Flight Details</Text>
                <View style={s.greenBox}>
                  <Text style={s.flightLine}>
                    {`${booking?.flight_details?.[0]?.origin_code ?? ""} → ${
                      booking?.flight_details?.[booking?.flight_details?.length - 1]?.destination_code ?? ""
                    }`}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Travel Date: </Text>
                    {booking?.created_at ? new Date(booking.created_at).toLocaleDateString() : ""}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>PNR: </Text>
                    {booking?.pnr_no ?? ""}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Airline: </Text>
                    {booking?.flight_details?.[0]?.airline_name ?? ""}
                  </Text>
                </View>
              </View>

              {/* RIGHT CARD: Charges */}
              <View style={s.card}>
                <Text style={s.cardHeader}>Charges</Text>
                <View style={s.redBox}>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Cancellation: </Text>
                    {chargesLoading ? "Loading..." : `Rs. ${charges.cancellation ?? "-"}`} / Pax
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Name Change: </Text>
                    {chargesLoading ? "Loading..." : `Rs. ${charges.nameChange ?? "-"}`} / Pax
                  </Text>
                </View>
              </View>
            </View>
          }
          data={[]}
          renderItem={null}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 2 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 4 },
  subtitle: { color: "#6b7280", marginBottom: 12 },

  paxCard: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  paxRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  paxSummary: { color: "#111827", fontWeight: "600", flexShrink: 1 },

  submitBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: { color: "#fff", fontWeight: "700" },

  cardHeader: {
    fontSize: 18,
    fontWeight: "700",
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    color: "#1f2937",
  },
  greenBox: { backgroundColor: "#ecfdf5", padding: 12, borderRadius: 10, gap: 6 },
  redBox: { backgroundColor: "#fef2f2", padding: 12, borderRadius: 10, gap: 6 },
  flightLine: { fontWeight: "600", color: "#374151" },
  metaLine: { color: "#374151" },
  metaLabel: { fontWeight: "700" },
});
