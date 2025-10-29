export interface homeType{
    origin:string;
    destination:string;
    date:string;
    travel:string;
}

export interface FlightListingResponse {
  status: boolean;
  message: string;
  result: any;
}


export interface FlightPNR {
  is_offline: string;
  fare_type_timeline: string;
  base_fare: number;
  requestId:string;
  Search_key:string;
  Flight_Key:string;
  selected_fare:number;
  fares: Fare[];
  stop_sold:String;
  fare_type:string;
  pnr_no: string;
  adult_price: number;
  infant_price: number;
  flight_pnr_segments: FlightPNRSegment[];
  available_seats: number;
  reference_number: string;
  flight_id: number;
  segments: FlightSegment[];
  requirements:string;
  pnr_id:number;
  child_price:number
  ticket_id:string;
  outside_api_provider:string;
  supplier_id:number;
  isinternational:boolean
}

export interface FlightPNRSegment {
  flightNo: string;
  depTime: string;  // "HH:mm" format
  arrTime: string;  // "HH:mm" format
}

export interface FlightSegment {
  airline_code: string;
  origin: string;
  destination: string;
  airline: string;
  origin_airport_name: string;
  destination_airport_name: string;
  airline_name: string;
  airline_logo: string;
  flightNo:string;
  arrTime:string;
  arrDate:string;
  depTime:string;
  depDate:string;
  baggage:string;
  cabin_baggage:string;
  adult_price:number;
  tax_price:number;
  fare_type:string;
  fare_type_timeline:string;
}


/* Top-level fare item */
export interface Fare {
  FareDetails: FareDetail[];
  FareType: number;
  Fare_Id: string;
  Fare_Key?: string | null;
  Food_onboard?: string | null;
  GSTMandatory?: boolean;
  LastFewSeats?: number | null;
  ProductClass?: string | null;
  PromptMessage?: string | null;
  Refundable?: boolean;
  Seats_Available?: string | null;
  Total_Amount: number;
  Warning?: string | null;
}

/* One element inside FareDetails */
export interface FareDetail {
  AirportTax_Amount: number;
  AirportTaxes: AirportTax[];
  Basic_Amount: number;
  CancellationCharges: ChargeRule[];
  Currency_Code: string;
  FareClasses: FareClass[];
  Free_Baggage: FreeBaggage;
  GST: number;
  Gross_Commission: number;
  Net_Commission: number;
  PAX_Type: number;
  Promo_Discount: number;
  RescheduleCharges: ChargeRule[];
  Service_Fee_Amount: number;
  TDS: number;
  Total_Amount: number;
  Trade_Markup_Amount: number;
  YQ_Amount: number;
}

/* Tax line */
export interface AirportTax {
  Tax_Amount: number;
  Tax_Code: string;
  Tax_Desc?: string | null;
}

/* Generic rule used for CancellationCharges and RescheduleCharges */
export interface ChargeRule {
  Applicablility: number;
  DurationFrom: number;
  DurationTo: number;
  DurationTypeFrom: number;
  DurationTypeTo: number;
  OfflineServiceFee: number;
  OnlineServiceFee: number;
  PassengerType: number;
  Remarks?: string;
  Return_Flight: boolean;
  Value: string;       // kept as string because sample uses "100", "50", "1000" etc.
  ValueType: number;  // numeric flag in sample
}

/* Fare class / booking class */
export interface FareClass {
  CabinClass?: string | null;
  Class_Code: string;
  Class_Desc?: string | null;
  FareBasis?: string | null;
  Privileges?: string | null;
  Segment_Id?: number;
}

/* Baggage allowance */
export interface FreeBaggage {
  Check_In_Baggage?: string | null;
  DisplayRemarks?: string | null;
  Hand_Baggage?: string | null;
}




export type PassengerType = "Adult" | "Child" | "Infant";

export interface Passenger {
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dob?: string;
  passportNo?: string;
  needWheelchair?: string;
  passport_expirydate?: string;
  passport_issuing_country_code?: string;
  nationality?: string;
}

export interface FormValues {
  passengers: Passenger[];
  mobile_no: string;
  email_id: string;
  display_price: string;
  payment_mode: string;
  total_price: string;
  terms: boolean;
  id?: number;
  payment_gateway?: string;
}

export interface PaymentCredential {
  id: number;
  gateway_name: string;
  client_id: string;
  client_secret: string;
  client_version: number;
  payment_module_id: number;
}
export interface PaymentModule {
  id:number
  payment_module: string;
}


