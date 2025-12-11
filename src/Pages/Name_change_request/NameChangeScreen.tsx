// src/screens/name_change_request/NameChangeRequestScreen.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import Header from "../../Components/Header/Header";
import { RootState } from "../../store/store";
import { postData } from "../../utils/axios";
import { endpoints } from "../../utils/endpoints";
import { Dropdown } from "react-native-element-dropdown";

type Pax = {
  pax_title: string;
  pax_first_name: string;
  pax_last_name: string;
  pax_type: string; // "adult" | "child" | "infant"
  booking_detail_id: number;
};

type PaxFormValue = { title: string; first: string; last: string };

export default function NameChangeRequestScreen() {
  const route = useRoute<any>();
  const bookingId = route?.params?.booking;
  const navigation = useNavigation<any>();

  const booking = useSelector((s: RootState) => s.editBooking.booking);
  const passengers: Pax[] = booking?.passengers ?? [];

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<Record<number, PaxFormValue>>({});
  const [charges, setCharges] = useState<{ nameChange?: string; cancellation?: string }>({});
  const [chargesLoading, setChargesLoading] = useState(false);

  // init form + switches once booking arrives
  useEffect(() => {
    if (!booking) return;
    const sel: Record<number, boolean> = {};
    const fm: Record<number, PaxFormValue> = {};

    passengers.forEach((p) => {
      sel[p.booking_detail_id] = false;

      const type = (p.pax_type || "").toLowerCase();
      const defaultTitle =
        type === "adult" ? "Mr." : type === "child" || type === "infant" ? "Mstr." : "Mr.";

      fm[p.booking_detail_id] = {
        title: p.pax_title || defaultTitle,
        first: p.pax_first_name || "",
        last: p.pax_last_name || "",
      };
    });

    setSelected(sel);
    setForm(fm);
  }, [booking, passengers]);

  // fetch charges
  useEffect(() => {
    (async () => {
      try {
        setChargesLoading(true);
        const res = await postData({
          url: endpoints.GET_AGENT_CHANGE_REQUEST_CHARGES,
          body: {},
        });
        if (res.status === 200 && res.data.status) {
          const list = res.data.result || [];
          setCharges({
            nameChange: list.find((i: any) => i.request_type === "name_change")?.charges,
            cancellation: list.find((i: any) => i.request_type === "booking_cancellation")?.charges,
          });
        }
      } catch (e: any) {
        Toast.show({
          type: "error",
          text1: "Failed to load charges",
          text2: e?.response?.data?.message || "Please try again.",
        });
      } finally {
        setChargesLoading(false);
      }
    })();
  }, []);

  const isBookingMismatch = !booking || (bookingId && booking.id !== bookingId);
  if (isBookingMismatch) {
    return (
      <View style={s.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  const selectedList = useMemo(
    () =>
      passengers
        .filter((p) => selected[p.booking_detail_id])
        .map((p) => ({
          selected: true,
          pax_title: form[p.booking_detail_id]?.title ?? p.pax_title,
          pax_first_name: form[p.booking_detail_id]?.first ?? p.pax_first_name,
          pax_last_name: form[p.booking_detail_id]?.last ?? p.pax_last_name,
          booking_detail_id: p.booking_detail_id,
        })),
    [passengers, selected, form]
  );

  const hasSelection = selectedList.length > 0;

  const unchangedCount = useMemo(() => {
    return selectedList.filter((changed) => {
      const orig = passengers.find((o) => o.booking_detail_id === changed.booking_detail_id);
      if (!orig) return false;
      const sameFirst =
        (orig.pax_first_name || "").trim().toLowerCase() ===
        (changed.pax_first_name || "").trim().toLowerCase();
      const sameLast =
        (orig.pax_last_name || "").trim().toLowerCase() ===
        (changed.pax_last_name || "").trim().toLowerCase();
      return sameFirst && sameLast;
    }).length;
  }, [selectedList, passengers]);

  const onSubmit = useCallback(async () => {
    if (!hasSelection) {
      Toast.show({
        type: "info",
        text1: "Heads up",
        text2: "Please select at least one passenger before submitting.",
      });
      return;
    }
    if (unchangedCount > 0) {
      Toast.show({
        type: "info",
        text1: "Name not updated",
        text2: "Change at least a word in first or last name.",
      });
      return;
    }

    const prevDetails = passengers.filter((orig) =>
      selectedList.some((c) => c.booking_detail_id === orig.booking_detail_id)
    );

    try {
      setLoading(true);
      const resp = await postData({
        url: endpoints.AGENT_NAME_CHANGE_REGUEST,
        body: {
          booking_id: booking?.id,
          agent_id: booking?.agent_id,
          pnr_id: booking?.pnr_id,
          passengers: selectedList,
          prev_passengers_details: prevDetails,
        },
      });

      if (resp.status === 200 && resp.data.status) {
        Toast.show({ type: "success", text1: "Request submitted", text2: resp.data.message });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: resp?.data?.message || "Something went wrong",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ??
          error?.response?.data?.error ??
          "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }, [hasSelection, unchangedCount, passengers, selectedList, booking, navigation]);

  // ---------------------------
  //         RENDER PAX ROW
  // ---------------------------
  const renderPax = ({ item: p }: { item: Pax }) => {
    const id = p.booking_detail_id;
    const isOn = !!selected[id];

    // Per-row title options (kept inside render; structure unchanged)
    const type = (p.pax_type || "").toLowerCase();
    const titleOptions =
      type === "adult"
        ? [
            { label: "Mr.", value: "Mr." },
            { label: "Mrs", value: "Mrs" },
            { label: "Ms.", value: "Ms." },
          ]
        : [
            { label: "Mstr.", value: "Mstr." },
            { label: "Miss.", value: "Miss." },
          ];

    return (
      <View style={s.paxCard}>
        <View style={s.paxRow}>
          <Switch
            value={isOn}
            onValueChange={(v) => setSelected((prev) => ({ ...prev, [id]: v }))}
          />

          {!isOn ? (
            <Text style={s.paxSummary}>
              {`${p.pax_title} ${p.pax_first_name} ${p.pax_last_name}`} – {p.pax_type}
            </Text>
          ) : (
            <View style={s.grid3}>
              {/* Title dropdown */}
              <Dropdown
                style={[s.input, { paddingHorizontal: 12 }]}
                data={titleOptions}
                labelField="label"
                valueField="value"
                placeholder="Select Title"
                value={form[id]?.title ?? titleOptions[0].value}
                onChange={(item) =>
                  setForm((prev) => ({
                    ...prev,
                    [id]: { ...(prev[id] || {}), title: item.value },
                  }))
                }
              />

              {/* First Name */}
              <TextInput
                value={form[id]?.first ?? ""}
                onChangeText={(t) =>
                  setForm((prev) => ({
                    ...prev,
                    [id]: { ...(prev[id] || {}), first: t.toUpperCase() },
                  }))
                }
                placeholder="First Name"
                style={s.input}
                autoCapitalize="characters"
              />

              {/* Last Name */}
              <TextInput
                value={form[id]?.last ?? ""}
                onChangeText={(t) =>
                  setForm((prev) => ({
                    ...prev,
                    [id]: { ...(prev[id] || {}), last: t.toUpperCase() },
                  }))
                }
                placeholder="Last Name"
                style={s.input}
                autoCapitalize="characters"
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <Header title="Name Change Request" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          ListHeaderComponent={
            <View style={s.container}>
              {/* LEFT CARD */}
              <View style={s.card}>
                <Text style={s.title}>Name Change Request</Text>
                <Text style={s.subtitle}>
                  Select passengers and update their details if required
                </Text>

                <FlatList
                  data={passengers}
                  keyExtractor={(x) => String(x.booking_detail_id)}
                  renderItem={renderPax}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />

                <View style={{ marginTop: 16 }}>
                  <TouchableOpacity
                    style={[s.submitBtn, (!hasSelection || loading) && { opacity: 0.7 }]}
                    onPress={onSubmit}
                    disabled={!hasSelection || loading}
                  >
                    {loading ? (
                      <ActivityIndicator />
                    ) : (
                      <Text style={s.submitText}>Submit Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* RIGHT: FLIGHT DETAILS */}
              <View style={s.card}>
                <Text style={s.cardHeader}>Flight Details</Text>
                <View style={s.greenBox}>
                  <Text style={s.flightLine}>
                    {`${booking?.flight_details?.[0]?.origin_code} → ${
                      booking?.flight_details?.[booking?.flight_details?.length - 1]
                        ?.destination_code
                    }`}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Travel Date: </Text>
                    {new Date(booking?.created_at).toLocaleDateString()}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>PNR: </Text>
                    {booking?.pnr_no ?? ""}
                  </Text>
                  <Text style={s.metaLine}>
                    <Text style={s.metaLabel}>Airline: </Text>
                    {booking?.flight_details?.[0]?.airline_name}
                  </Text>
                </View>
              </View>

              {/* RIGHT: CHARGES */}
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
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  grid3: { flex: 1, gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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
