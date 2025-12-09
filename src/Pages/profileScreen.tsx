// src/screens/ProfileScreen.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Clipboard from "@react-native-clipboard/clipboard";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dropdown } from "react-native-element-dropdown";

import { AuthContext } from "../authContext";
import { postData } from "../utils/axios";
import { endpoints } from "../utils/endpoints";
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { styles } from "./Registration/styles";

    export interface Companytype {
            support_email?: string;
            support_number?: string;
            pan_attachment?: any;
            pan_card_holder_name: string;
            pan_number?: string;
            gst_number?: string;
        
        }


        export interface usertype {
        email: string;
        phone: string;
        title: string;
        first_name: string
        last_name: string
    }



    export interface Infotype {
    country: number;
    state: number;
    city: string;
    street: string;
    pincode: string
}


export interface P_input {

    current_password: string
    new_password: string
}

/* ----------------------------
   Schemas (mirrors web intent)
----------------------------- */
const userSchema = yup.object({
  title: yup.string().required("Title required"),
  first_name: yup.string().required("First name required"),
  last_name: yup.string().required("Last name required"),
  email: yup.string().email().required(),
  phone: yup.string().required("Mobile required"),
});

const infoSchema = yup.object({
  country: yup.number().typeError("Select country").required("Select country"),
  state: yup.number().typeError("Select state").required("Select state"),
  city: yup.string().required("City required"),
  street: yup.string().required("Address required"),
  pincode: yup.string().required("Pincode required"),
});

const companySchema: yup.ObjectSchema<Companytype> = yup.object({
 pan_card_holder_name:yup.string().required("PAN Card Holder Name is Required"),
  pan_number: yup.string().optional(),
  gst_number: yup.string().optional(),
  support_email: yup.string().email(),
  support_number: yup.string().optional(),
  pan_attachment: yup.string().optional(),
});

const pwdSchema = yup.object({
  current_password: yup.string().required("Current password required"),
  new_password: yup
    .string()
    .min(6, "Min 6 chars")
    .required("New password required"),
});




export default function ProfileScreen() {
  const { logout } = useContext(AuthContext);

  // ---- Local state (mirrors the web component flags) ----
  const [agent, setAgent] = useState<any>(null);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [isUserSaving, setIsUserSaving] = useState(false);
  const [isInfoSaving, setIsInfoSaving] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [isPwdSaving, setIsPwdSaving] = useState(false);

  const [copied, setCopied] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showNewpass, setshowNewpass] = useState(false);
  const [showCurrent, setshowCurrent] = useState(false);
  

  // ---- Forms (same segmentation as web) ----
  const {
    control: userControl,
    handleSubmit: handleUserSubmit,
    setValue: setUserValue,
    formState: { errors: userErrors },
  } = useForm<usertype>({
    resolver: yupResolver(userSchema),
    mode: "onChange",
  });

  const {
    control: infoControl,
    handleSubmit: handleInfoSubmit,
    setValue: setInfoValue,
    watch: watchInfo,
    formState: { errors: infoErrors },
  } = useForm<Infotype>({
    resolver: yupResolver(infoSchema),
    mode: "onChange",
  });

  const {
    control: companyControl,
    handleSubmit: handleCompanySubmit,
    setValue: setCompanyValue,
    formState: { errors: companyErrors },
  } = useForm<Companytype>({
    resolver: yupResolver(companySchema),
    mode: "onChange",
  });

  const {
    control: pwdControl,
    handleSubmit: handlePwdSubmit,
    formState: { errors: pwdErrors },
  } = useForm<P_input>({
    resolver: yupResolver(pwdSchema),
    mode: "onChange",
  });

  const selectedCountry = watchInfo("country"); // number | null
  const agentId = useMemo(() => agent?.id, [agent]);
  const apiKey = useMemo(() => agent?.shared_api_key || "", [agent]);
  const panAttachmentUrl = useMemo(() => agent?.pan_attachment || "", [agent]);

  // Dropdown option builders (ensure numeric values)
  const titleOptions = useMemo(
    () => [
      { label: "Mrs.", value: "Mrs" },
      { label: "Mr.", value: "Mr" },
      { label: "Ms.", value: "Ms" },
    ],
    []
  );
  const countryOptions = useMemo(
    () => countries.map((c) => ({ label: c.country_name, value: Number(c.id) })),
    [countries]
  );
  const stateOptions = useMemo(
    () => states.map((s) => ({ label: s.state, value: Number(s.id) })),
    [states]
  );

  
  const fetchAgentDetails = async (id: number) => {
    try {
      const response = await postData({
        url: endpoints.GET_AGENT_DETAILS_BY_ID,
        body: { agent_id: id },
      });
      if (response?.status === 200 && response?.data?.status) {
        return response.data.data || response.data.result || null;
      }
    } catch (err) {
      console.error("Error fetching agent details:", err);
    }
  };

  const loadStatesForCountry = async (countryId: number) => {
    try {
      const response = await postData({
        url: endpoints.GET_STATES_BY_COUNTRY_ID,
        body: { countryId },
      });
      if (response?.status === 200 && response?.data?.status) 
        setStates(response.data?.result || []);
    } catch (err) {
      console.error("Error loading states:", err);
    }
  };

  
  useEffect(() => {
    const load = async () => {
      try {
        const storeUserData = await AsyncStorage.getItem("userData");
        const cachedUser = storeUserData ? JSON.parse(storeUserData) : null;

        if (cachedUser?.id) {
          const value = await fetchAgentDetails(cachedUser.id);
          if (value) {
            setAgent(value);
            // Set forms from value
            setUserValue("title", value.initial || "");
            setUserValue("first_name", value.first_name || "");
            setUserValue("last_name", value.last_name || "");
            setUserValue("email", value.email_id || "");
            setUserValue("phone", value.mobile_no || "");

            setCompanyValue("pan_card_holder_name", value.pan_name || "");
            setCompanyValue("pan_number", value.pan_no || "");
            setCompanyValue("gst_number", value.gst_no || "");
            setCompanyValue("support_email", value.support_email || "");
            setCompanyValue("support_number", value.support_number || "");
            setCompanyValue("pan_attachment", value.pan_attachment || "");

            setInfoValue(
              "country",
              Number(value.country_id) 
            );
            setInfoValue(
              "state",
               Number(value.state) 
            );
            setInfoValue("city", value.city || "");
            setInfoValue("street", value.address || "");
            setInfoValue("pincode", value.pincode || "");

            await AsyncStorage.setItem("userData", JSON.stringify(value));
          } 
        }

        // Countries
        const response = await postData({
          url: endpoints.GET_COUNTRIES,
          body: {},
        });
        if (response.status === 200) setCountries(response.data?.result || []);

        // States pre-load for known country (from value or cache)
        const agentContryId =
          (agent?.country_id as number | undefined) ??
          (cachedUser?.country_id as number | undefined);
        if (agentContryId != null) {
          await loadStatesForCountry(Number(agentContryId));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

 
  useEffect(() => {
    if (!selectedCountry) return;
    loadStatesForCountry(Number(selectedCountry));
   
  }, [selectedCountry]);

 
  const onSaveUser = async (f: usertype) => {
    if (!agentId) return Alert.alert("Missing", "Agent not loaded yet.");
    setIsUserSaving(true);
    try {
      const res = await postData({
        url: endpoints.UPDATE_AGENT_DETAILS,
        body: {
          agent_id: agentId,
          initial: f.title,
          first_name: f.first_name,
          last_name: f.last_name,
          mobile_no: f.phone,
        },
      });

      if (res.status === 200 && res.data?.status) {
        const updated = {
          ...agent,
          initial: f.title,
          first_name: f.first_name,
          last_name: f.last_name,
          mobile_no: f.phone,
        };
        setAgent(updated);
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        Alert.alert("Success", res.data.message || "User updated.");
      } else {
        Alert.alert("Error", res.data?.message || "Update failed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed.");
    } finally {
      setIsUserSaving(false);
    }
  };

  const onSaveCompany = async (f: Companytype) => {
    if (!agentId) return Alert.alert("Missing", "Agent not loaded yet.");
    setIsCompanySaving(true);
    try {
      const res = await postData({
        url: endpoints.UPDATE_AGENT_DETAILS,
        body: {
          agent_id: agentId,
          pan_name: f.pan_card_holder_name,
          pan_no: f.pan_number,
          gst_no: f.gst_number,
          support_email: f.support_email,
          support_number: f.support_number,
          pan_attachment: f.pan_attachment || "",
        },
      });

      if (res.status === 200 && res.data?.status) {
        const updated = {
          ...agent,
          pan_name: f.pan_card_holder_name,
          pan_no: f.pan_number,
          gst_no: f.gst_number,
          support_email: f.support_email,
          support_number: f.support_number,
          pan_attachment: f.pan_attachment || agent?.pan_attachment || "",
        };
        setAgent(updated);
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        Alert.alert("Success", res.data.message || "Company updated.");
      } else {
        Alert.alert("Error", res.data?.message || "Update failed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed.");
    } finally {
      setIsCompanySaving(false);
    }
  };

  const onSaveInfo = async (f: Infotype) => {
    if (!agentId) return Alert.alert("Missing", "Agent not loaded yet.");
    setIsInfoSaving(true);
    try {
      const res = await postData({
        url: endpoints.UPDATE_AGENT_DETAILS,
        body: {
          agent_id: agentId,
          country_id: f.country,
          state: f.state,
          city: f.city,
          address: f.street,
          pincode: f.pincode,
        },
      });

      if (res.status === 200 && res.data?.status) {
        const updated = {
          ...agent,
          country_id: f.country,
          state: f.state,
          city: f.city,
          address: f.street,
          pincode: f.pincode,
        };
        setAgent(updated);
        await AsyncStorage.setItem("userData", JSON.stringify(updated));
        Alert.alert("Success", res.data.message || "Address updated.");
      } else {
        Alert.alert("Error", res.data?.message || "Update failed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Update failed.");
    } finally {
      setIsInfoSaving(false);
    }
  };

  const onChangePassword = async (f: P_input) => {
    if (!agentId) return Alert.alert("Missing", "Agent not loaded yet.");
    setIsPwdSaving(true);
    try {
      const res = await postData({
        url: endpoints.UPDATE_AGENT_PASSWORD,
        body: {
          agent_id: agentId,
          old_pass: f.current_password,
          new_pass: f.new_password,
        },
      });

      if (res.status === 200 && res.data?.status) {
        Alert.alert("Success", res.data.message || "Password updated.");
        if (!stayLoggedIn) {
          await AsyncStorage.removeItem("userData");
          logout();
        }
      } else {
        Alert.alert("Error", res.data?.message || "Password update failed.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message || "Password update failed.");
    } finally {
      setIsPwdSaving(false);
    }
  };

  // Copy API key
  const copyApiKey = () => {
    if (!apiKey) return;
    Clipboard.setString(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 900);
  };

  if (loadingProfile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#305E92" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#eee",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700" }}>User Profile</Text>
        <TouchableOpacity
          onPress={logout}
          style={{
            backgroundColor: "#ef4444",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* User Information */}
        <SectionTitle title="User Information" />
        <View style={{ gap: 12 }}>
          {/* Title (Dropdown) */}
          <Labeled label="Title">
            <Controller
              control={userControl}
              name="title"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  style={DROPDOWN}
                  data={titleOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Title"
                  value={value || null}
                  onChange={(item: any) => onChange(item.value)}
                />
              )}
            />
            <ErrorText text={userErrors?.title?.message} />
          </Labeled>

          <Labeled label="First Name">
            <Controller
              control={userControl}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={INPUT} value={value || ""} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
            <ErrorText text={userErrors?.first_name?.message} />
          </Labeled>

          <Labeled label="Last Name">
            <Controller
              control={userControl}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={INPUT} value={value || ""} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
            <ErrorText text={userErrors?.last_name?.message} />
          </Labeled>

          <Labeled label="Email">
            <Controller
              control={userControl}
              name="email"
              render={({ field: { value } }) => (
                <TextInput
                  style={[INPUT, { backgroundColor: "#f5f5f5" }]}
                  value={value || ""}
                  editable={false}
                />
              )}
            />
            <ErrorText text={userErrors?.email?.message} />
          </Labeled>

          <Labeled label="Mobile">
            <Controller
              control={userControl}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={INPUT}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
            <ErrorText text={userErrors?.phone?.message} />
          </Labeled>

          <PrimaryButton
            title={isUserSaving ? "Updating..." : "Update"}
            disabled={isUserSaving}
            onPress={handleUserSubmit(onSaveUser)}
          />
        </View>

        {/* Company Information */}
        <SectionTitle title="Company Information" />
        <View style={{ gap: 12 }}>
          <Labeled label="PAN Name">
            <Controller
              control={companyControl}
              name="pan_card_holder_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[INPUT, { backgroundColor: "#f5f5f5" }]}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={false}
                />
              )}
            />
            <ErrorText text={companyErrors?.pan_card_holder_name?.message} />
          </Labeled>

          <Labeled label="PAN Number">
            <Controller
              control={companyControl}
              name="pan_number"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[INPUT, { backgroundColor: "#f5f5f5" }]}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={false}
                />
              )}
            />
            <ErrorText text={companyErrors?.pan_number?.message} />
          </Labeled>

          <Labeled label="PAN Attachment">
            {!!panAttachmentUrl ? (
              <TouchableOpacity onPress={() => Linking.openURL(panAttachmentUrl)}>
                <Text style={{ color: "#2563EB", fontWeight: "600" }}>
                  View Current PAN Attachment
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "#6B7280" }}>No attachment uploaded</Text>
            )}
          </Labeled>

          <Labeled label="GST No.">
            <Controller
              control={companyControl}
              name="gst_number"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={INPUT} value={value || ""} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
          </Labeled>

          <Labeled label="Support Email">
            <Controller
              control={companyControl}
              name="support_email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={INPUT}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                />
              )}
            />
            <ErrorText text={companyErrors?.support_email?.message} />
          </Labeled>

          <Labeled label="Support Number">
            <Controller
              control={companyControl}
              name="support_number"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={INPUT}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
            <ErrorText text={companyErrors?.support_number?.message} />
          </Labeled>

          <PrimaryButton
            title={isCompanySaving ? "Updating..." : "Update"}
            disabled={isCompanySaving}
            onPress={handleCompanySubmit(onSaveCompany)}
          />
        </View>

        {/* Address / Info (Country/State as Dropdowns) */}
        <SectionTitle title="Company Information" />
        <View style={{ gap: 12 }}>
          <Labeled label="Country">
            <Controller
              control={infoControl}
              name="country"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  style={DROPDOWN}
                  data={countryOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Select country"
                  value={typeof value === "number" ? value : null}
                  onChange={async (item: any) => {
                    const cid = Number(item.value);
                    onChange(cid);
                    setStates([]);               // clear old list
                    await loadStatesForCountry(cid);
                  }}
                  search
                  inputSearchStyle={DROPDOWN_SEARCH}
                  placeholderStyle={DROPDOWN_PLACEHOLDER}
                  selectedTextStyle={DROPDOWN_SELECTED}
                />
              )}
            />
            <ErrorText text={infoErrors?.country?.message} />
          </Labeled>

          <Labeled label="State">
            <Controller
              control={infoControl}
              name="state"
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  style={DROPDOWN}
                  data={stateOptions}
                  labelField="label"
                  valueField="value"
                  placeholder="Select state"
                  value={typeof value === "number" ? value : null}
                  onChange={(item: any) => onChange(Number(item.value))}
                  search
                  inputSearchStyle={DROPDOWN_SEARCH}
                  placeholderStyle={DROPDOWN_PLACEHOLDER}
                  selectedTextStyle={DROPDOWN_SELECTED}
                />
              )}
            />
            <ErrorText text={infoErrors?.state?.message} />
          </Labeled>

          <Labeled label="City">
            <Controller
              control={infoControl}
              name="city"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={INPUT} value={value || ""} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
            <ErrorText text={infoErrors?.city?.message} />
          </Labeled>

          <Labeled label="Address of Street">
            <Controller
              control={infoControl}
              name="street"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput style={INPUT} value={value || ""} onChangeText={onChange} onBlur={onBlur} />
              )}
            />
            <ErrorText text={infoErrors?.street?.message} />
          </Labeled>

          <Labeled label="Pincode">
            <Controller
              control={infoControl}
              name="pincode"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={INPUT}
                  value={value || ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                />
              )}
            />
            <ErrorText text={infoErrors?.pincode?.message} />
          </Labeled>

          <PrimaryButton
            title={isInfoSaving ? "Updating..." : "Update"}
            disabled={isInfoSaving}
            onPress={handleInfoSubmit(onSaveInfo)}
          />
        </View>

        {/* My Markup */}
        {/* <SectionTitle title="My Markup" />
        <View style={{ gap: 12 }}>
          <Text style={{ color: "#666" }}>
            (Add your markup controls here — bind to a schema and POST like the others.)
          </Text>
          <PrimaryButton title="Update" onPress={() => Alert.alert("Stub", "Implement markup API")} />
        </View> */}

        {/* API Key */}
        <SectionTitle title="API Key" />
        <View style={{ gap: 12 }}>
          <TextInput style={[INPUT, { backgroundColor: "#f5f5f5" }]} value={apiKey} editable={false} />
          <PrimaryButton title={copied ? "Copied!" : "Copy"} onPress={copyApiKey} />
        </View>

        {/* Change Password */}
        <SectionTitle title="Change Password" />
        <View style={{ gap: 12 }}>
          <Labeled label="Current Password">
  <View style={styles.passwordWrapper}>
    <Controller
      control={pwdControl}
      name="current_password"
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={styles.input}
          value={value || ""}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={!showCurrent}
          placeholder="Current Password"
          placeholderTextColor="#999"
        />
      )}
    />
    <TouchableOpacity
      style={styles.eye}
      onPress={() => setshowCurrent(!showCurrent)}
    >
      {showCurrent ? (
        <Entypo name="eye-with-line" color="#000" size={24} />
      ) : (
        <AntDesign name="eye" color="#000" size={24} />
      )}
    </TouchableOpacity>
  </View>
  <ErrorText text={pwdErrors?.current_password?.message} />
</Labeled>

          <Labeled label="New Password">
  <View style={styles.passwordWrapper}>
    <Controller
      control={pwdControl}
      name="new_password"
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          style={styles.input}
          value={value || ""}
          onChangeText={onChange}
          onBlur={onBlur}
          secureTextEntry={!showNewpass}
          placeholder="New Password"
          placeholderTextColor="#999"
        />
      )}
    />
    <TouchableOpacity
      style={styles.eye}
      onPress={() => setshowNewpass(!showNewpass)}
    >
      {showNewpass ? (
        <Entypo name="eye-with-line" color="#000" size={24} />
      ) : (
        <AntDesign name="eye" color="#000" size={24} />
      )}
    </TouchableOpacity>
  </View>
  <ErrorText text={pwdErrors?.new_password?.message} />
</Labeled>

          {/* Stay logged in after password change */}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Switch value={stayLoggedIn} onValueChange={setStayLoggedIn} />
            <Text style={{ marginLeft: 8, color: "#374151" }}>
              Stay logged in after password change
            </Text>
          </View>

          <PrimaryButton
            title={isPwdSaving ? "Updating..." : "Update"}
            disabled={isPwdSaving}
            onPress={handlePwdSubmit(onChangePassword)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------------- UI helpers (simple + consistent) ---------------- */
const INPUT = {
  height: 48,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  paddingHorizontal: 12,
  fontSize: 16,
  backgroundColor: "#fff",
  color: "#000",
} as const;

const DROPDOWN = {
  height: 48,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  paddingHorizontal: 12,
  justifyContent: "center",
  backgroundColor: "#fff",
} as const;

const DROPDOWN_PLACEHOLDER = {
  color: "#9CA3AF",
} as const;

const DROPDOWN_SELECTED = {
  color: "#111827",
  fontSize: 16,
} as const;

const DROPDOWN_SEARCH = {
  height: 40,
  fontSize: 16,
} as const;

function SectionTitle({ title }: { title: string }) {
  return (
    <View
      style={{
        marginTop: 24,
        marginBottom: 12,
        backgroundColor: "#305E92",
        borderRadius: 8,
      }}
    >
      <Text
        style={{
          color: "#fff",
          textAlign: "center",
          paddingVertical: 10,
          fontWeight: "700",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text style={{ marginBottom: 6, color: "#374151", fontWeight: "600" }}>{label}</Text>
      {children}
    </View>
  );
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return <Text style={{ color: "#ef4444", marginTop: 4 }}>{text}</Text>;
}

function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: "#EA8B27",
        height: 48,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "700" }}>{title}</Text>
    </TouchableOpacity>
  );
}
