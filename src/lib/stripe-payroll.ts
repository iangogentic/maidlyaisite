import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface ConnectAccountSetup {
  crew_member_id: number;
  email: string;
  name: string;
  phone?: string;
  tax_id?: string;
  address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface PayoutRequest {
  connect_account_id: string;
  amount_cents: number;
  description: string;
  metadata?: Record<string, string>;
}

export class StripePayrollService {
  
  /**
   * Create a Stripe Connect account for a crew member
   */
  static async createConnectAccount(setup: ConnectAccountSetup): Promise<string> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: setup.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: setup.name.split(' ')[0],
          last_name: setup.name.split(' ').slice(1).join(' '),
          email: setup.email,
          phone: setup.phone,
          ssn_last_4: setup.tax_id?.slice(-4),
          address: setup.address ? {
            line1: setup.address.line1,
            city: setup.address.city,
            state: setup.address.state,
            postal_code: setup.address.postal_code,
            country: setup.address.country,
          } : undefined,
        },
        metadata: {
          crew_member_id: setup.crew_member_id.toString(),
        },
      });

      return account.id;
    } catch (error: any) {
      console.error('Error creating Stripe Connect account:', error);
      
      // Handle specific Stripe Connect not enabled error
      if (error.type === 'StripeInvalidRequestError' && error.message?.includes('signed up for Connect')) {
        throw new Error('Stripe Connect not enabled. Please enable Connect in your Stripe Dashboard first.');
      }
      
      throw new Error(`Failed to create payment account: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate onboarding link for crew member to complete Stripe setup
   */
  static async createAccountLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return accountLink.url;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new Error('Failed to create onboarding link');
    }
  }

  /**
   * Check if Connect account is fully onboarded and can receive payments
   */
  static async checkAccountStatus(accountId: string): Promise<{
    charges_enabled: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    requirements: string[];
  }> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      
      return {
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        requirements: account.requirements?.currently_due || [],
      };
    } catch (error) {
      console.error('Error checking account status:', error);
      throw new Error('Failed to check account status');
    }
  }

  /**
   * Send payment to crew member via Stripe Connect
   */
  static async sendPayout(payout: PayoutRequest): Promise<string> {
    try {
      const transfer = await stripe.transfers.create({
        amount: payout.amount_cents,
        currency: 'usd',
        destination: payout.connect_account_id,
        description: payout.description,
        metadata: payout.metadata || {},
      });

      return transfer.id;
    } catch (error) {
      console.error('Error sending payout:', error);
      throw new Error('Failed to send payment');
    }
  }

  /**
   * Process batch payouts for multiple crew members
   */
  static async processBatchPayouts(payouts: PayoutRequest[]): Promise<{
    successful: Array<{ connect_account_id: string; transfer_id: string }>;
    failed: Array<{ connect_account_id: string; error: string }>;
  }> {
    const successful: Array<{ connect_account_id: string; transfer_id: string }> = [];
    const failed: Array<{ connect_account_id: string; error: string }> = [];

    for (const payout of payouts) {
      try {
        const transferId = await this.sendPayout(payout);
        successful.push({
          connect_account_id: payout.connect_account_id,
          transfer_id: transferId,
        });
      } catch (error) {
        failed.push({
          connect_account_id: payout.connect_account_id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Get transfer details for tracking payment status
   */
  static async getTransferStatus(transferId: string): Promise<{
    id: string;
    amount: number;
    status: string;
    created: number;
    destination: string;
  }> {
    try {
      const transfer = await stripe.transfers.retrieve(transferId);
      
      return {
        id: transfer.id,
        amount: transfer.amount,
        status: (typeof transfer.destination_payment === 'object' && transfer.destination_payment?.status) || 'pending',
        created: transfer.created,
        destination: transfer.destination as string,
      };
    } catch (error) {
      console.error('Error getting transfer status:', error);
      throw new Error('Failed to get transfer status');
    }
  }

  /**
   * Generate 1099 tax information for a crew member
   */
  static async generate1099Data(accountId: string, taxYear: number): Promise<{
    total_earnings: number;
    account_holder_name: string;
    tax_id: string;
  }> {
    try {
      // Get all transfers to this account for the tax year
      const startOfYear = new Date(taxYear, 0, 1).getTime() / 1000;
      const endOfYear = new Date(taxYear, 11, 31, 23, 59, 59).getTime() / 1000;

      const transfers = await stripe.transfers.list({
        destination: accountId,
        created: {
          gte: startOfYear,
          lte: endOfYear,
        },
        limit: 100,
      });

      const totalEarnings = transfers.data.reduce((sum, transfer) => sum + transfer.amount, 0);

      // Get account details for tax reporting
      const account = await stripe.accounts.retrieve(accountId);
      
      return {
        total_earnings: totalEarnings,
        account_holder_name: `${account.individual?.first_name} ${account.individual?.last_name}`,
        tax_id: (account.individual as any)?.ssn_last_4 || '',
      };
    } catch (error) {
      console.error('Error generating 1099 data:', error);
      throw new Error('Failed to generate tax data');
    }
  }

  /**
   * Calculate payroll for a crew member based on time entries
   */
  static calculatePay(timeEntries: Array<{
    regular_hours: number;
    overtime_hours: number;
  }>, hourlyRate: number, bonuses: number = 0, deductions: number = 0): {
    regular_pay: number;
    overtime_pay: number;
    gross_pay: number;
    net_pay: number;
    total_hours: number;
  } {
    const totalRegularHours = timeEntries.reduce((sum, entry) => sum + entry.regular_hours, 0);
    const totalOvertimeHours = timeEntries.reduce((sum, entry) => sum + entry.overtime_hours, 0);
    
    const regularPay = totalRegularHours * hourlyRate;
    const overtimePay = totalOvertimeHours * hourlyRate * 1.5; // 1.5x for overtime
    const grossPay = regularPay + overtimePay + bonuses;
    const netPay = grossPay - deductions;

    return {
      regular_pay: Math.round(regularPay * 100), // Convert to cents
      overtime_pay: Math.round(overtimePay * 100),
      gross_pay: Math.round(grossPay * 100),
      net_pay: Math.round(netPay * 100),
      total_hours: totalRegularHours + totalOvertimeHours,
    };
  }
}
