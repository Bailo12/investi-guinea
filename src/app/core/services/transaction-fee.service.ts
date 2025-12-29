import { Injectable } from '@angular/core';

export interface FeeCalculation {
  amount: number;
  fee: number;
  feePercentage: number;
  total: number;
  currency: 'GNF' | 'USD' | 'EUR';
}

export interface TransactionFeeConfig {
  deposit: {
    min: number;
    max: number;
    fixed?: number;
  };
  withdrawal: {
    min: number;
    max: number;
    fixed?: number;
  };
  investment: {
    min: number;
    max: number;
    fixed?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransactionFeeService {
  private readonly DEFAULT_FEE_MIN = 0.05; // 5%
  private readonly DEFAULT_FEE_MAX = 0.10; // 10%
  private readonly DEFAULT_FIXED_FEE = 500; // GNF

  /**
   * Calculate transaction fee based on amount and transaction type
   * Fee range: 5-10% with minimum fixed fee
   */
  calculateFee(
    amount: number,
    type: 'deposit' | 'withdrawal' | 'investment',
    currency: 'GNF' | 'USD' | 'EUR' = 'GNF'
  ): FeeCalculation {
    // Determine fee percentage based on amount (higher amount = lower percentage)
    let feePercentage: number;
    
    if (amount < 100000) {
      feePercentage = this.DEFAULT_FEE_MAX; // 10% for small amounts
    } else if (amount < 500000) {
      feePercentage = 0.075; // 7.5% for medium amounts
    } else {
      feePercentage = this.DEFAULT_FEE_MIN; // 5% for large amounts
    }

    // Calculate fee
    let fee = amount * feePercentage;

    // Apply minimum fixed fee
    const minFee = this.getMinimumFee(currency);
    if (fee < minFee) {
      fee = minFee;
      feePercentage = (fee / amount) * 100;
    }

    // Round fee to 2 decimal places
    fee = Math.round(fee * 100) / 100;

    return {
      amount,
      fee,
      feePercentage: Math.round(feePercentage * 10000) / 100, // Round to 2 decimal places
      total: amount + fee,
      currency
    };
  }

  /**
   * Calculate fee for deposit (usually lower)
   */
  calculateDepositFee(amount: number, currency: 'GNF' | 'USD' | 'EUR' = 'GNF'): FeeCalculation {
    // Deposits typically have lower fees (3-7%)
    let feePercentage: number;
    
    if (amount < 100000) {
      feePercentage = 0.07; // 7%
    } else if (amount < 500000) {
      feePercentage = 0.05; // 5%
    } else {
      feePercentage = 0.03; // 3%
    }

    let fee = amount * feePercentage;
    const minFee = this.getMinimumFee(currency);
    if (fee < minFee) {
      fee = minFee;
      feePercentage = (fee / amount) * 100;
    }

    fee = Math.round(fee * 100) / 100;

    return {
      amount,
      fee,
      feePercentage: Math.round(feePercentage * 10000) / 100,
      total: amount + fee,
      currency
    };
  }

  /**
   * Calculate fee for withdrawal (usually higher)
   */
  calculateWithdrawalFee(amount: number, currency: 'GNF' | 'USD' | 'EUR' = 'GNF'): FeeCalculation {
    // Withdrawals typically have higher fees (5-10%)
    return this.calculateFee(amount, 'withdrawal', currency);
  }

  /**
   * Calculate fee for investment
   */
  calculateInvestmentFee(amount: number, currency: 'GNF' | 'USD' | 'EUR' = 'GNF'): FeeCalculation {
    // Investments typically have moderate fees (5-8%)
    let feePercentage: number;
    
    if (amount < 100000) {
      feePercentage = 0.08; // 8%
    } else if (amount < 500000) {
      feePercentage = 0.06; // 6%
    } else {
      feePercentage = 0.05; // 5%
    }

    let fee = amount * feePercentage;
    const minFee = this.getMinimumFee(currency);
    if (fee < minFee) {
      fee = minFee;
      feePercentage = (fee / amount) * 100;
    }

    fee = Math.round(fee * 100) / 100;

    return {
      amount,
      fee,
      feePercentage: Math.round(feePercentage * 10000) / 100,
      total: amount + fee,
      currency
    };
  }

  /**
   * Get minimum fee based on currency
   */
  private getMinimumFee(currency: 'GNF' | 'USD' | 'EUR'): number {
    switch (currency) {
      case 'GNF':
        return 500; // 500 GNF
      case 'USD':
        return 0.50; // $0.50
      case 'EUR':
        return 0.50; // €0.50
      default:
        return 500;
    }
  }

  /**
   * Get fee breakdown for display
   */
  getFeeBreakdown(calculation: FeeCalculation): {
    label: string;
    value: string;
    type: 'amount' | 'fee' | 'total';
  }[] {
    return [
      {
        label: 'Montant',
        value: this.formatCurrency(calculation.amount, calculation.currency),
        type: 'amount'
      },
      {
        label: `Frais (${calculation.feePercentage}%)`,
        value: this.formatCurrency(calculation.fee, calculation.currency),
        type: 'fee'
      },
      {
        label: 'Total',
        value: this.formatCurrency(calculation.total, calculation.currency),
        type: 'total'
      }
    ];
  }

  private formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  }
}


