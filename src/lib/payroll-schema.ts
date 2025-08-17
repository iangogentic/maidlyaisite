// Payroll and Time Tracking Database Schema

export interface CrewMember {
  id: number;
  name: string;
  email: string;
  phone?: string;
  employee_id: string;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  payment_type: 'hourly' | 'salary' | 'per_job' | 'commission';
  hourly_rate?: number;
  salary_amount?: number;
  commission_rate?: number;
  stripe_connect_account_id?: string;
  tax_id?: string; // SSN or EIN for 1099
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications?: string[];
  skills?: string[];
  team_id?: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: number;
  crew_member_id: number;
  booking_id?: number;
  clock_in_time: string;
  clock_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  location_clock_in?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  location_clock_out?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'active' | 'completed' | 'approved' | 'disputed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  id: number;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: 'draft' | 'processing' | 'paid' | 'failed';
  total_amount_cents: number;
  total_crew_members: number;
  created_at: string;
  processed_at?: string;
}

export interface PayrollEntry {
  id: number;
  payroll_period_id: number;
  crew_member_id: number;
  regular_hours: number;
  overtime_hours: number;
  bonus_amount_cents: number;
  deductions_cents: number;
  gross_pay_cents: number;
  net_pay_cents: number;
  stripe_transfer_id?: string;
  payment_status: 'pending' | 'processing' | 'paid' | 'failed';
  payment_date?: string;
  tax_withholding_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Bonus {
  id: number;
  crew_member_id: number;
  booking_id?: number;
  type: 'performance' | 'customer_rating' | 'upsell' | 'punctuality' | 'other';
  amount_cents: number;
  description: string;
  date_earned: string;
  payroll_period_id?: number;
  created_at: string;
}

export interface Deduction {
  id: number;
  crew_member_id: number;
  type: 'equipment_damage' | 'uniform' | 'training' | 'advance' | 'other';
  amount_cents: number;
  description: string;
  date_applied: string;
  payroll_period_id?: number;
  created_at: string;
}

export interface TaxDocument {
  id: number;
  crew_member_id: number;
  tax_year: number;
  document_type: '1099-NEC' | 'W-2' | 'W-4';
  total_earnings_cents: number;
  file_url?: string;
  generated_at: string;
  sent_at?: string;
}
