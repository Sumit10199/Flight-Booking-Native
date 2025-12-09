import { FlightPNR, FormValues } from "../types";


function generateSimpleKey(length = 36) {
    const chars = '-/ABCDEFGHIJKLMNOPQRSTUVWXYZ-/abcdefghijklmnopqrstuvwxyz-/0123456789-/';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
export const transformBookingDataAIrIQ = (data: FormValues, flightDetails: FlightPNR | null) => {
    const adult_info = data.passengers
        .filter((p) => p.type === "Adult")
        .map((p) => ({
            title: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            dob: p.dob?.replace(/-/g, "/") || "",
            passport_expirydate: p.passport_expirydate?.replace(/-/g, "/") || "",
            passport_issuing_country_code: p.passport_issuing_country_code || "",
            nationality: p.nationality || "",
            passport_number: p.passportNo || ""

        }));

    const child_info = data.passengers
        .filter((p) => p.type === "Child")
        .map((p) => ({
            title: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            dob: p.dob?.replace(/-/g, "/") || "",
            passport_expirydate: p.passport_expirydate?.replace(/-/g, "/") || "",
            passport_issuing_country_code: p.passport_issuing_country_code || "",
            nationality: p.nationality || "",
            passport_number: p.passportNo || ""
        }));

    const infant_info = data.passengers
        .filter((p) => p.type === "Infant")
        .map((p) => ({
            title: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            dob: p.dob?.replace(/-/g, "/") || "",
            travel_with: "1",
            passport_expirydate: p.passport_expirydate?.replace(/-/g, "/") || "",
            passport_issuing_country_code: p.passport_issuing_country_code || "",
            nationality: p.nationality || "",
            passport_number: p.passportNo || ""
        }));

    return {
        ticket_id: flightDetails?.ticket_id,
        total_pax: data.passengers.length.toString(),
        adult: adult_info.length.toString(),
        child: child_info.length.toString(),
        infant: infant_info.length.toString(),
        adult_info,
        child_info,
        infant_info,
    };
};


export const transformBookingDataEASE2FLY = (data: FormValues, flightDetails: FlightPNR | null) => {
    const adult_info = data.passengers
        .filter((p) => p.type === "Adult")
        .map((p) => ({
            ttl: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            passport_dob: p.dob || "",
            whlchr: p.needWheelchair?.toString() === "YES" ? "true" : "false",
            passport_no: p.passportNo ?? "",
            passport_nationality: "",
            passport_exp: ""
        }));

    const child_info = data.passengers
        .filter((p) => p.type === "Child")
        .map((p) => ({
            ttl: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            passport_dob: p.dob || "",
            whlchr: p.needWheelchair?.toString() === "YES" ? "true" : "false",
            passport_no: p.passportNo,
            passport_nationality: "",
            passport_exp: "",
            age: "",
        }));

    const infant_info = data.passengers
        .filter((p) => p.type === "Infant")
        .map((p) => ({
            ttl: p.title,
            first_name: p.firstName,
            last_name: p.lastName,
            passport_dob: p.dob || "",
            whlchr: p.needWheelchair?.toString() === "YES" ? "true" : "false",
            passport_no: p.passportNo,
            passport_nationality: "",
            passport_exp: "",
            age: "",
        }));

    return {
        adult_info,
        child_info,
        infant_info,
        adults: adult_info.length,
        child: child_info.length,
        infant: infant_info.length,
        sector_id: flightDetails?.ticket_id,
        fare: flightDetails?.base_fare,
        phone: data.mobile_no,
        email: data.email_id,
        reference_no: generateSimpleKey()
    };
};

export const transformBookingDataTravelogy = (flightDetails: FlightPNR | null, userData: any) => {

    return {
        "requestId": flightDetails?.requestId,
        "Search_Key": flightDetails?.Search_key,
        "AirRepriceRequests": [
            {
                "Flight_Key": flightDetails?.Flight_Key,
                "Fare_Id": flightDetails?.fares[flightDetails.selected_fare].Fare_Id
            }
        ],
        "Customer_Mobile": userData.mobile_no,
        "GST_Input": false,
        "SinglePricing": true
    }
}


export const calculateTotalPrice = (flightDetails: FlightPNR | null, seatsStringRaw: any) => {
    if (!flightDetails || !seatsStringRaw) return 0;

    const regex = /(\d+)\s*(Adult|Adults|Child|Children|Infant|Infants)/gi;
    let match: RegExpExecArray | null;
    let total = 0;

    while ((match = regex.exec(seatsStringRaw)) !== null) {
        const count = parseInt(match[1], 10);
        const type = match[2].toLowerCase();
        if (type.startsWith("adult"))
            total +=
                count *
                (flightDetails.adult_price ||
                    flightDetails?.fares[0]?.FareDetails[0]?.Total_Amount ||
                    0);
        else if (type.startsWith("child"))
            total += count * (flightDetails.child_price || 0);
        else if (type.startsWith("infant"))
            total += count * (flightDetails.infant_price || 0);
    }

    return total;
};

export const parseTravellers = (travellers: string) => {
    const regex = /(\d+)\s*(Adult|Adults|Child|Children|Infant|Infants)/gi;
    let match: RegExpExecArray | null;
    const counts = { Adult: 0, Child: 0, Infant: 0 };

    while ((match = regex.exec(travellers)) !== null) {
        const num = parseInt(match[1], 10);
        const type = match[2].toLowerCase();
        if (type.startsWith("adult")) counts.Adult += num;
        if (type.startsWith("child")) counts.Child += num;
        if (type.startsWith("infant")) counts.Infant += num;
    }
    return counts;
};