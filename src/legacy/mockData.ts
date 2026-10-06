import { Transaction, AccountNode, TransactionEdge, TypologySequence, AuditLogEntry, AlertNotification } from '../types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    txn_id: "18429",
    timestamp: "2026-01-14T09:12:00",
    from_account: "A100342",
    to_account: "A100891",
    from_bank: 3,
    to_bank: 7,
    amount: 9450.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 99.9,
    status: "New",
    top_factors: [
      { feature: "structuring_score", value: 6, contribution: 0.41, description: "6 transfers just below $10k threshold in 18h" },
      { feature: "peer_cohort_zscore", value: 4.2, contribution: 0.28, description: "4.2 sigma deviation vs NAICS peer median" },
      { feature: "from_count_24h", value: 8, contribution: 0.19, description: "High 24h burst outbound frequency" },
      { feature: "fan_out_ratio", value: 3.5, contribution: 0.12, description: "Fund dispersal across 3+ downstream counterparties" }
    ],
    narrative: "This account initiated six transfers just below the $10,000 reporting threshold within 18 hours, a pattern highly indicative of structuring (smurfing). Combined with an unusually high transaction frequency relative to its NAICS peer cohort, this activity warrants immediate manual review and SAR escalation.",
    counterfactual: {
      baseline_score: 99.9,
      amount_reduction_target: 3500,
      amount_reduction_score: 41.2,
      days_dispersal_target: 14,
      days_dispersal_score: 34.0
    },
    peerCohort: {
      cohortName: "Commercial SMB - Wholesale Trade (NAICS 423)",
      subjectVolume: 9450,
      subjectVelocity: 8,
      points: [
        { accountId: "P101", volume: 2200, velocity: 1.2 },
        { accountId: "P102", volume: 1800, velocity: 0.8 },
        { accountId: "P103", volume: 3100, velocity: 1.5 },
        { accountId: "P104", volume: 2700, velocity: 1.1 },
        { accountId: "P105", volume: 4200, velocity: 2.0 },
        { accountId: "P106", volume: 1500, velocity: 0.9 },
        { accountId: "P107", volume: 3800, velocity: 1.7 },
        { accountId: "P108", volume: 2900, velocity: 1.3 },
        { accountId: "P109", volume: 4900, velocity: 2.2 },
        { accountId: "P110", volume: 2100, velocity: 1.0 },
        { accountId: "A100342", volume: 9450, velocity: 8.0, isSubject: true }
      ]
    }
  },
  {
    txn_id: "17906",
    timestamp: "2026-01-12T22:47:00",
    from_account: "A100205",
    to_account: "A100342",
    from_bank: 5,
    to_bank: 3,
    amount: 34210.50,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 92.4,
    status: "Under Review",
    top_factors: [
      { feature: "cyclic_flow_score", value: 0.82, contribution: 0.38, description: "Closed directed 3-node cycle detected" },
      { feature: "from_flow_imbalance", value: 0.62, contribution: 0.26, description: "Outflow matches 92% of inbound wire within 4h" },
      { feature: "fan_out_ratio", value: 4.1, contribution: 0.18, description: "Layering dispersal through intermediate nodes" }
    ],
    narrative: "Funds from this transaction were traced returning to originating account A100205 within 6 hours through intermediate accounts A100342 and A100891 — a classic layering cycle. Rapid round-trip velocity and acute flow imbalance support escalation to federal authorities.",
    counterfactual: {
      baseline_score: 92.4,
      amount_reduction_target: 12000,
      amount_reduction_score: 48.6,
      days_dispersal_target: 21,
      days_dispersal_score: 39.1
    },
    peerCohort: {
      cohortName: "Mid-Market Logistics (NAICS 488)",
      subjectVolume: 34210,
      subjectVelocity: 6.5,
      points: [
        { accountId: "P201", volume: 8200, velocity: 1.1 },
        { accountId: "P202", volume: 11000, velocity: 1.4 },
        { accountId: "P203", volume: 9500, velocity: 1.0 },
        { accountId: "P204", volume: 14000, velocity: 1.8 },
        { accountId: "P205", volume: 7800, velocity: 0.9 },
        { accountId: "P206", volume: 12500, velocity: 1.5 },
        { accountId: "A100205", volume: 34210, velocity: 6.5, isSubject: true }
      ]
    }
  },
  {
    txn_id: "19102",
    timestamp: "2026-01-14T08:05:00",
    from_account: "A100114",
    to_account: "A100891",
    from_bank: 12,
    to_bank: 7,
    amount: 48900.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 96.8,
    status: "New",
    top_factors: [
      { feature: "dormant_burst_score", value: 5.8, contribution: 0.44, description: "310 days zero activity preceding wire" },
      { feature: "peer_cohort_zscore", value: 4.9, contribution: 0.31, description: "4.9 sigma deviation from dormant cohort" },
      { feature: "benford_law_deviation", value: 3.6, contribution: 0.15, description: "First digit anomaly in historical ledger" }
    ],
    narrative: "Originating account remained completely dormant for 310 consecutive days before suddenly initiating a high-value $48,900 wire transfer to unverified beneficiary A100891. The magnitude represents an abrupt 5.8-sigma divergence from historical operating profile.",
    counterfactual: {
      baseline_score: 96.8,
      amount_reduction_target: 8000,
      amount_reduction_score: 44.0,
      days_dispersal_target: 30,
      days_dispersal_score: 36.5
    },
    peerCohort: {
      cohortName: "Dormant Corporate Holding (NAICS 551)",
      subjectVolume: 48900,
      subjectVelocity: 4.0,
      points: [
        { accountId: "P301", volume: 500, velocity: 0.1 },
        { accountId: "P302", volume: 1200, velocity: 0.2 },
        { accountId: "P303", volume: 800, velocity: 0.1 },
        { accountId: "A100114", volume: 48900, velocity: 4.0, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18831",
    timestamp: "2026-01-13T16:30:00",
    from_account: "A100205",
    to_account: "A100778",
    from_bank: 5,
    to_bank: 2,
    amount: 9900.00,
    currency: "USD",
    payment_format: "Cash",
    risk_score: 94.2,
    status: "New",
    top_factors: [
      { feature: "structuring_score", value: 8, contribution: 0.48, description: "Deposit calibrated $100 below BSA threshold" },
      { feature: "from_count_24h", value: 11, contribution: 0.25, description: "4 regional teller visits in single afternoon" },
      { feature: "cash_deposit_ratio", value: 0.91, contribution: 0.17, description: "91% cash ratio on commercial entity" }
    ],
    narrative: "Consecutive cash deposit of $9,900 processed at branch teller, following three identical sub-$10k deposits across distinct regional branches within 24 hours. The smurfing signature meets statutory FinCEN filing requirements.",
    counterfactual: {
      baseline_score: 94.2,
      amount_reduction_target: 4000,
      amount_reduction_score: 38.0,
      days_dispersal_target: 10,
      days_dispersal_score: 29.5
    },
    peerCohort: {
      cohortName: "Retail Storefront (NAICS 452)",
      subjectVolume: 9900,
      subjectVelocity: 11.0,
      points: [
        { accountId: "P401", volume: 2200, velocity: 2.1 },
        { accountId: "P402", volume: 3400, velocity: 3.0 },
        { accountId: "A100205", volume: 9900, velocity: 11.0, isSubject: true }
      ]
    }
  },
  {
    txn_id: "19320",
    timestamp: "2026-01-14T07:15:00",
    from_account: "A100552",
    to_account: "A100903",
    from_bank: 8,
    to_bank: 15,
    amount: 125000.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 88.0,
    status: "Under Review",
    top_factors: [
      { feature: "cross_border_velocity", value: 3.9, contribution: 0.37, description: "Offshore jurisdiction corridor" },
      { feature: "peer_cohort_zscore", value: 3.8, contribution: 0.29, description: "Unusually large ticket vs small balance" },
      { feature: "from_flow_imbalance", value: 0.71, contribution: 0.21, description: "85% of funds drained within 48h" }
    ],
    narrative: "Unusually large $125,000 wire dispatched to an overseas financial institution with minimal KYC records. The outflow accounts for 85% of balance received within the prior 48 hours.",
    counterfactual: {
      baseline_score: 88.0,
      amount_reduction_target: 35000,
      amount_reduction_score: 52.0,
      days_dispersal_target: 14,
      days_dispersal_score: 41.0
    },
    peerCohort: {
      cohortName: "International Trading Corp (NAICS 523)",
      subjectVolume: 125000,
      subjectVelocity: 3.5,
      points: [
        { accountId: "P501", volume: 45000, velocity: 1.5 },
        { accountId: "P502", volume: 62000, velocity: 2.0 },
        { accountId: "A100552", volume: 125000, velocity: 3.5, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18215",
    timestamp: "2026-01-13T11:22:00",
    from_account: "A100619",
    to_account: "A100342",
    from_bank: 4,
    to_bank: 3,
    amount: 72000.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 85.1,
    status: "Under Review",
    top_factors: [
      { feature: "benford_law_deviation", value: 4.1, contribution: 0.35, description: "Synthetic amount distribution" },
      { feature: "fan_out_ratio", value: 2.8, contribution: 0.29, description: "Inflow followed by immediate dispersion" },
      { feature: "from_count_24h", value: 5, contribution: 0.18, description: "Elevated outbound volume" }
    ],
    narrative: "Amount exhibits significant chi-square divergence from Benford's Law expectations. Counterparty account A100342 immediately dispersed the incoming funds across sub-threshold wires.",
    counterfactual: {
      baseline_score: 85.1,
      amount_reduction_target: 20000,
      amount_reduction_score: 46.0,
      days_dispersal_target: 10,
      days_dispersal_score: 38.0
    },
    peerCohort: {
      cohortName: "Regional Equipment Dealer (NAICS 423)",
      subjectVolume: 72000,
      subjectVelocity: 5.0,
      points: [
        { accountId: "P601", volume: 18000, velocity: 1.8 },
        { accountId: "A100619", volume: 72000, velocity: 5.0, isSubject: true }
      ]
    }
  },
  {
    txn_id: "19412",
    timestamp: "2026-01-14T10:04:00",
    from_account: "A100411",
    to_account: "A100832",
    from_bank: 1,
    to_bank: 9,
    amount: 61400.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 81.5,
    status: "New",
    top_factors: [
      { feature: "fan_in_ratio", value: 4.8, contribution: 0.39, description: "Aggregated from 12 personal micro-accounts" },
      { feature: "cyclic_flow_score", value: 0.42, contribution: 0.24, description: "Downstream loop back to affiliate entity" },
      { feature: "from_flow_imbalance", value: 0.55, contribution: 0.20, description: "Funnel account rapid balance clearance" }
    ],
    narrative: "Account collected micro-transfers from 12 separate retail depositors over 36 hours before executing this unified $61,400 wire outflow, characteristic of a funnel account consolidation typology.",
    counterfactual: {
      baseline_score: 81.5,
      amount_reduction_target: 15000,
      amount_reduction_score: 42.0,
      days_dispersal_target: 14,
      days_dispersal_score: 35.0
    },
    peerCohort: {
      cohortName: "Personal Checking Aggregate (NAICS 522)",
      subjectVolume: 61400,
      subjectVelocity: 7.2,
      points: [
        { accountId: "P701", volume: 6000, velocity: 1.0 },
        { accountId: "A100411", volume: 61400, velocity: 7.2, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18105",
    timestamp: "2026-01-12T19:15:00",
    from_account: "A100891",
    to_account: "A100205",
    from_bank: 7,
    to_bank: 5,
    amount: 43000.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 79.2,
    status: "Under Review",
    top_factors: [
      { feature: "cyclic_flow_score", value: 0.65, contribution: 0.36, description: "Return loop of layered funds" },
      { feature: "peer_cohort_zscore", value: 3.1, contribution: 0.27, description: "Rapid fund transit under 45 minutes" }
    ],
    narrative: "Intermediate layering transfer completing the second hop of the cyclic flow between A100205, A100342, and A100891. Fund dwell time between receipt and transmission was under 45 minutes.",
    counterfactual: {
      baseline_score: 79.2,
      amount_reduction_target: 10000,
      amount_reduction_score: 45.0,
      days_dispersal_target: 7,
      days_dispersal_score: 38.0
    },
    peerCohort: {
      cohortName: "Financial Brokerage (NAICS 523)",
      subjectVolume: 43000,
      subjectVelocity: 4.5,
      points: [
        { accountId: "P801", volume: 15000, velocity: 1.5 },
        { accountId: "A100891", volume: 43000, velocity: 4.5, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18640",
    timestamp: "2026-01-13T14:10:00",
    from_account: "A100778",
    to_account: "A100199",
    from_bank: 2,
    to_bank: 11,
    amount: 18500.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 78.4,
    status: "New",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 5.1, contribution: 0.42, description: "5.1 sigma ticket size deviation" },
      { feature: "from_count_24h", value: 7, contribution: 0.26, description: "Velocity spike on newly created account" }
    ],
    narrative: "Outflow amount deviates 5.1 standard deviations from consumer baseline. Counterparty A100199 has been subject to multiple law enforcement subpoenas across peer banking institutions.",
    counterfactual: {
      baseline_score: 78.4,
      amount_reduction_target: 5000,
      amount_reduction_score: 39.0,
      days_dispersal_target: 10,
      days_dispersal_score: 31.0
    },
    peerCohort: {
      cohortName: "Personal Retail Checking (NAICS 522)",
      subjectVolume: 18500,
      subjectVelocity: 5.1,
      points: [
        { accountId: "P901", volume: 2100, velocity: 0.8 },
        { accountId: "A100778", volume: 18500, velocity: 5.1, isSubject: true }
      ]
    }
  },
  {
    txn_id: "17450",
    timestamp: "2026-01-11T13:40:00",
    from_account: "A100647",
    to_account: "A100721",
    from_bank: 6,
    to_bank: 10,
    amount: 9200.00,
    currency: "USD",
    payment_format: "Cheque",
    risk_score: 74.6,
    status: "SAR Filed",
    top_factors: [
      { feature: "structuring_score", value: 4, contribution: 0.38, description: "Sequential check issuance below $10k" },
      { feature: "benford_law_deviation", value: 2.7, contribution: 0.24, description: "Clustered high first digit" }
    ],
    narrative: "Fourth cashier's check negotiated in a 5-day period by the same drawer, each priced between $9,000 and $9,500. SAR #2026-0144 was officially filed by Dakshraj Singh (Owner).",
    counterfactual: {
      baseline_score: 74.6,
      amount_reduction_target: 3000,
      amount_reduction_score: 32.0,
      days_dispersal_target: 14,
      days_dispersal_score: 28.0
    },
    peerCohort: {
      cohortName: "Retail Contractor (NAICS 238)",
      subjectVolume: 9200,
      subjectVelocity: 3.8,
      points: [
        { accountId: "P1001", volume: 3200, velocity: 1.2 },
        { accountId: "A100647", volume: 9200, velocity: 3.8, isSubject: true }
      ]
    }
  },
  // Medium Risk (40-69)
  {
    txn_id: "18550",
    timestamp: "2026-01-13T10:18:00",
    from_account: "A100308",
    to_account: "A100512",
    from_bank: 14,
    to_bank: 14,
    amount: 27500.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 68.2,
    status: "New",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 2.9, contribution: 0.33, description: "Moderate ticket deviation" },
      { feature: "from_flow_imbalance", value: 0.41, contribution: 0.21, description: "Unusual vendor distribution" }
    ],
    narrative: "Intra-bank corporate transfer with unusual ticket velocity. Invoices provided by entity are undergoing automated optical character recognition verification.",
    counterfactual: {
      baseline_score: 68.2,
      amount_reduction_target: 10000,
      amount_reduction_score: 35.0,
      days_dispersal_target: 5,
      days_dispersal_score: 30.0
    },
    peerCohort: {
      cohortName: "Commercial Construction (NAICS 236)",
      subjectVolume: 27500,
      subjectVelocity: 2.8,
      points: [
        { accountId: "P1101", volume: 15000, velocity: 1.5 },
        { accountId: "A100308", volume: 27500, velocity: 2.8, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18990",
    timestamp: "2026-01-14T06:45:00",
    from_account: "A100441",
    to_account: "A100342",
    from_bank: 16,
    to_bank: 3,
    amount: 14800.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 64.9,
    status: "Under Review",
    top_factors: [
      { feature: "from_count_24h", value: 4, contribution: 0.29, description: "New counterparty link to known hub" },
      { feature: "peer_cohort_zscore", value: 2.5, contribution: 0.22, description: "Velocity uptick" }
    ],
    narrative: "Transfer to flagged hub account A100342 without prior business interaction. Monitored for potential expansion of the structuring ring.",
    counterfactual: {
      baseline_score: 64.9,
      amount_reduction_target: 5000,
      amount_reduction_score: 32.0,
      days_dispersal_target: 7,
      days_dispersal_score: 26.0
    },
    peerCohort: {
      cohortName: "Wholesale Trade (NAICS 423)",
      subjectVolume: 14800,
      subjectVelocity: 2.5,
      points: [
        { accountId: "P1201", volume: 8000, velocity: 1.2 },
        { accountId: "A100441", volume: 14800, velocity: 2.5, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18312",
    timestamp: "2026-01-12T17:30:00",
    from_account: "A100832",
    to_account: "A100619",
    from_bank: 9,
    to_bank: 4,
    amount: 8750.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 61.4,
    status: "New",
    top_factors: [
      { feature: "structuring_score", value: 2, contribution: 0.26, description: "Minor threshold clustering" },
      { feature: "velocity_score", value: 2.1, contribution: 0.22, description: "Weekly payroll surge" }
    ],
    narrative: "Slightly elevated velocity across business payroll processing. Score elevated into medium tier due to proximity to the $10,000 threshold.",
    counterfactual: {
      baseline_score: 61.4,
      amount_reduction_target: 3000,
      amount_reduction_score: 28.0,
      days_dispersal_target: 5,
      days_dispersal_score: 22.0
    },
    peerCohort: {
      cohortName: "Payroll Services (NAICS 541)",
      subjectVolume: 8750,
      subjectVelocity: 2.1,
      points: [
        { accountId: "P1301", volume: 6000, velocity: 1.4 },
        { accountId: "A100832", volume: 8750, velocity: 2.1, isSubject: true }
      ]
    }
  },
  {
    txn_id: "17650",
    timestamp: "2026-01-11T18:04:00",
    from_account: "A100512",
    to_account: "A100114",
    from_bank: 14,
    to_bank: 12,
    amount: 32000.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 58.7,
    status: "Cleared",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 2.1, contribution: 0.27, description: "Dividend payment volume" },
      { feature: "from_flow_imbalance", value: 0.32, contribution: 0.18, description: "Quarterly distribution" }
    ],
    narrative: "Documented quarterly shareholder distribution verified through verified corporate minutes. Cleared as false positive by compliance.",
    counterfactual: {
      baseline_score: 58.7,
      amount_reduction_target: 10000,
      amount_reduction_score: 26.0,
      days_dispersal_target: 10,
      days_dispersal_score: 21.0
    },
    peerCohort: {
      cohortName: "Corporate Treasury (NAICS 551)",
      subjectVolume: 32000,
      subjectVelocity: 2.0,
      points: [
        { accountId: "P1401", volume: 20000, velocity: 1.1 },
        { accountId: "A100512", volume: 32000, velocity: 2.0, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18021",
    timestamp: "2026-01-12T15:20:00",
    from_account: "A100199",
    to_account: "A100721",
    from_bank: 11,
    to_bank: 10,
    amount: 19400.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 53.5,
    status: "New",
    top_factors: [
      { feature: "velocity_score", value: 1.9, contribution: 0.24, description: "ACH disbursement spike" },
      { feature: "peer_cohort_zscore", value: 1.8, contribution: 0.20, description: "Above median monthly volume" }
    ],
    narrative: "Automated ACH distribution to commercial supplier. Mild statistical deviation from 60-day median ticket size.",
    counterfactual: {
      baseline_score: 53.5,
      amount_reduction_target: 5000,
      amount_reduction_score: 24.0,
      days_dispersal_target: 7,
      days_dispersal_score: 19.0
    },
    peerCohort: {
      cohortName: "Commercial Services (NAICS 541)",
      subjectVolume: 19400,
      subjectVelocity: 1.9,
      points: [
        { accountId: "P1501", volume: 12000, velocity: 1.2 },
        { accountId: "A100199", volume: 19400, velocity: 1.9, isSubject: true }
      ]
    }
  },
  {
    txn_id: "19230",
    timestamp: "2026-01-14T09:40:00",
    from_account: "A100903",
    to_account: "A100411",
    from_bank: 15,
    to_bank: 1,
    amount: 11200.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 49.3,
    status: "New",
    top_factors: [
      { feature: "from_flow_imbalance", value: 0.28, contribution: 0.21, description: "Flow imbalance" },
      { feature: "velocity_score", value: 1.5, contribution: 0.17, description: "Minor velocity bump" }
    ],
    narrative: "Standard corporate wire slightly exceeding automated straight-through processing limit. No indication of organized layering.",
    counterfactual: {
      baseline_score: 49.3,
      amount_reduction_target: 3000,
      amount_reduction_score: 22.0,
      days_dispersal_target: 4,
      days_dispersal_score: 18.0
    },
    peerCohort: {
      cohortName: "Commercial Services (NAICS 541)",
      subjectVolume: 11200,
      subjectVelocity: 1.5,
      points: [
        { accountId: "P1601", volume: 9000, velocity: 1.0 },
        { accountId: "A100903", volume: 11200, velocity: 1.5, isSubject: true }
      ]
    }
  },
  {
    txn_id: "17812",
    timestamp: "2026-01-12T11:05:00",
    from_account: "A100721",
    to_account: "A100647",
    from_bank: 10,
    to_bank: 6,
    amount: 6500.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 45.1,
    status: "Cleared",
    top_factors: [
      { feature: "velocity_score", value: 1.4, contribution: 0.19, description: "Regular ACH debit" },
      { feature: "from_count_24h", value: 3, contribution: 0.15, description: "Routine batch" }
    ],
    narrative: "Routine inter-company loan service payment backed by audited financing agreement.",
    counterfactual: {
      baseline_score: 45.1,
      amount_reduction_target: 2000,
      amount_reduction_score: 20.0,
      days_dispersal_target: 5,
      days_dispersal_score: 15.0
    },
    peerCohort: {
      cohortName: "Intercompany Loans (NAICS 522)",
      subjectVolume: 6500,
      subjectVelocity: 1.4,
      points: [
        { accountId: "P1701", volume: 5000, velocity: 1.0 },
        { accountId: "A100721", volume: 6500, velocity: 1.4, isSubject: true }
      ]
    }
  },
  {
    txn_id: "18720",
    timestamp: "2026-01-13T15:55:00",
    from_account: "A100552",
    to_account: "A100308",
    from_bank: 8,
    to_bank: 14,
    amount: 15600.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 42.0,
    status: "New",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 1.6, contribution: 0.20, description: "Vendor invoice" },
      { feature: "from_flow_imbalance", value: 0.22, contribution: 0.14, description: "Balanced ledger" }
    ],
    narrative: "Single wire payment to established industrial vendor. No suspicious network topology identified.",
    counterfactual: {
      baseline_score: 42.0,
      amount_reduction_target: 5000,
      amount_reduction_score: 18.0,
      days_dispersal_target: 3,
      days_dispersal_score: 14.0
    },
    peerCohort: {
      cohortName: "Industrial Supply (NAICS 423)",
      subjectVolume: 15600,
      subjectVelocity: 1.6,
      points: [
        { accountId: "P1801", volume: 12000, velocity: 1.1 },
        { accountId: "A100552", volume: 15600, velocity: 1.6, isSubject: true }
      ]
    }
  },
  // Low Risk (<40)
  {
    txn_id: "19490",
    timestamp: "2026-01-14T11:02:00",
    from_account: "A100114",
    to_account: "A100441",
    from_bank: 12,
    to_bank: 16,
    amount: 3450.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 12.3,
    status: "Cleared",
    top_factors: [
      { feature: "account_tenure_months", value: 48, contribution: -0.28, description: "Long-standing account" },
      { feature: "peer_cohort_zscore", value: 0.2, contribution: -0.18, description: "Exact payroll match" }
    ],
    narrative: "Bi-weekly scheduled payroll disbursement matching employee ledger. Nominal low-risk baseline.",
    counterfactual: { baseline_score: 12.3, amount_reduction_target: 1000, amount_reduction_score: 8.0, days_dispersal_target: 1, days_dispersal_score: 6.0 },
    peerCohort: { cohortName: "Payroll (NAICS 541)", subjectVolume: 3450, subjectVelocity: 0.2, points: [{ accountId: "P1901", volume: 3400, velocity: 0.2, isSubject: true }] }
  },
  {
    txn_id: "19502",
    timestamp: "2026-01-14T11:15:00",
    from_account: "A100619",
    to_account: "A100512",
    from_bank: 4,
    to_bank: 14,
    amount: 820.50,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 5.4,
    status: "Cleared",
    top_factors: [
      { feature: "regular_utility_flag", value: 1, contribution: -0.35, description: "Automated municipal debit" },
      { feature: "peer_cohort_zscore", value: 0.1, contribution: -0.22, description: "Nominal" }
    ],
    narrative: "Recurring municipal electric utility bill. Verified ACH originator.",
    counterfactual: { baseline_score: 5.4, amount_reduction_target: 200, amount_reduction_score: 3.0, days_dispersal_target: 1, days_dispersal_score: 2.0 },
    peerCohort: { cohortName: "Utilities (NAICS 221)", subjectVolume: 820, subjectVelocity: 0.1, points: [{ accountId: "P2001", volume: 800, velocity: 0.1, isSubject: true }] }
  },
  {
    txn_id: "17201",
    timestamp: "2026-01-11T09:30:00",
    from_account: "A100832",
    to_account: "A100778",
    from_bank: 9,
    to_bank: 2,
    amount: 2150.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 18.2,
    status: "Cleared",
    top_factors: [
      { feature: "kyc_verification_level", value: 3, contribution: -0.25, description: "Tier-1 verified entities" },
      { feature: "velocity_score", value: 0.4, contribution: -0.15, description: "Low frequency" }
    ],
    narrative: "Standard corporate supplier invoice settlement between verified tier-1 banking institutions.",
    counterfactual: { baseline_score: 18.2, amount_reduction_target: 500, amount_reduction_score: 12.0, days_dispersal_target: 2, days_dispersal_score: 10.0 },
    peerCohort: { cohortName: "Commercial (NAICS 423)", subjectVolume: 2150, subjectVelocity: 0.4, points: [{ accountId: "P2101", volume: 2000, velocity: 0.4, isSubject: true }] }
  },
  {
    txn_id: "17315",
    timestamp: "2026-01-11T12:00:00",
    from_account: "A100411",
    to_account: "A100647",
    from_bank: 1,
    to_bank: 6,
    amount: 450.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 7.1,
    status: "Cleared",
    top_factors: [
      { feature: "account_tenure_months", value: 36, contribution: -0.31, description: "3-year clean history" }
    ],
    narrative: "SaaS software subscription auto-renewal. Nominal volume consistent with historic profile.",
    counterfactual: { baseline_score: 7.1, amount_reduction_target: 100, amount_reduction_score: 4.0, days_dispersal_target: 1, days_dispersal_score: 3.0 },
    peerCohort: { cohortName: "Software (NAICS 511)", subjectVolume: 450, subjectVelocity: 0.1, points: [{ accountId: "P2201", volume: 400, velocity: 0.1, isSubject: true }] }
  },
  {
    txn_id: "18390",
    timestamp: "2026-01-13T08:50:00",
    from_account: "A100721",
    to_account: "A100308",
    from_bank: 10,
    to_bank: 14,
    amount: 1420.00,
    currency: "USD",
    payment_format: "Cheque",
    risk_score: 15.6,
    status: "Cleared",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 0.3, contribution: -0.19, description: "Standard freelance deposit" }
    ],
    narrative: "Branch check deposit for professional consulting services. Aligns with client 1099 profile.",
    counterfactual: { baseline_score: 15.6, amount_reduction_target: 300, amount_reduction_score: 10.0, days_dispersal_target: 1, days_dispersal_score: 8.0 },
    peerCohort: { cohortName: "Consulting (NAICS 541)", subjectVolume: 1420, subjectVelocity: 0.3, points: [{ accountId: "P2301", volume: 1300, velocity: 0.3, isSubject: true }] }
  },
  {
    txn_id: "19045",
    timestamp: "2026-01-14T07:45:00",
    from_account: "A100512",
    to_account: "A100619",
    from_bank: 14,
    to_bank: 4,
    amount: 5200.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 22.4,
    status: "Cleared",
    top_factors: [
      { feature: "from_flow_imbalance", value: 0.12, contribution: -0.14, description: "Regular supplier retainer" }
    ],
    narrative: "Standard corporate supplier retainer with established 24-month counterparty track record.",
    counterfactual: { baseline_score: 22.4, amount_reduction_target: 1000, amount_reduction_score: 15.0, days_dispersal_target: 2, days_dispersal_score: 12.0 },
    peerCohort: { cohortName: "Supplier (NAICS 423)", subjectVolume: 5200, subjectVelocity: 0.5, points: [{ accountId: "P2401", volume: 5000, velocity: 0.5, isSubject: true }] }
  },
  {
    txn_id: "17580",
    timestamp: "2026-01-11T16:20:00",
    from_account: "A100903",
    to_account: "A100114",
    from_bank: 15,
    to_bank: 12,
    amount: 780.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 9.8,
    status: "Cleared",
    top_factors: [
      { feature: "regular_utility_flag", value: 1, contribution: -0.29, description: "Office telecom services" }
    ],
    narrative: "Recurring telecom broadband provider bill. Zero anomalies detected in transaction graph.",
    counterfactual: { baseline_score: 9.8, amount_reduction_target: 100, amount_reduction_score: 6.0, days_dispersal_target: 1, days_dispersal_score: 5.0 },
    peerCohort: { cohortName: "Telecom (NAICS 517)", subjectVolume: 780, subjectVelocity: 0.1, points: [{ accountId: "P2501", volume: 750, velocity: 0.1, isSubject: true }] }
  },
  {
    txn_id: "18800",
    timestamp: "2026-01-13T17:10:00",
    from_account: "A100199",
    to_account: "A100552",
    from_bank: 11,
    to_bank: 8,
    amount: 3800.00,
    currency: "USD",
    payment_format: "Wire",
    risk_score: 24.1,
    status: "Cleared",
    top_factors: [
      { feature: "account_tenure_months", value: 60, contribution: -0.22, description: "Established treasury transfer" }
    ],
    narrative: "Internal transfer between company checking and interest-bearing commercial liquidity reserve.",
    counterfactual: { baseline_score: 24.1, amount_reduction_target: 800, amount_reduction_score: 16.0, days_dispersal_target: 1, days_dispersal_score: 14.0 },
    peerCohort: { cohortName: "Treasury (NAICS 522)", subjectVolume: 3800, subjectVelocity: 0.4, points: [{ accountId: "P2601", volume: 3500, velocity: 0.4, isSubject: true }] }
  },
  {
    txn_id: "18290",
    timestamp: "2026-01-12T16:40:00",
    from_account: "A100647",
    to_account: "A100411",
    from_bank: 6,
    to_bank: 1,
    amount: 1150.00,
    currency: "USD",
    payment_format: "ACH",
    risk_score: 8.5,
    status: "Cleared",
    top_factors: [
      { feature: "velocity_score", value: 0.2, contribution: -0.26, description: "Janitorial facility upkeep" }
    ],
    narrative: "Monthly facilities management disbursement. Consistent with nominal operating overhead.",
    counterfactual: { baseline_score: 8.5, amount_reduction_target: 200, amount_reduction_score: 5.0, days_dispersal_target: 1, days_dispersal_score: 4.0 },
    peerCohort: { cohortName: "Facilities (NAICS 561)", subjectVolume: 1150, subjectVelocity: 0.2, points: [{ accountId: "P2701", volume: 1100, velocity: 0.2, isSubject: true }] }
  },
  {
    txn_id: "19180",
    timestamp: "2026-01-14T09:00:00",
    from_account: "A100308",
    to_account: "A100721",
    from_bank: 14,
    to_bank: 10,
    amount: 290.00,
    currency: "USD",
    payment_format: "Cash",
    risk_score: 3.2,
    status: "Cleared",
    top_factors: [
      { feature: "peer_cohort_zscore", value: 0.1, contribution: -0.32, description: "Petty cash replenishment" }
    ],
    narrative: "Over-the-counter retail petty cash deposit. Negligible ticket size, zero money laundering indicators.",
    counterfactual: { baseline_score: 3.2, amount_reduction_target: 50, amount_reduction_score: 2.0, days_dispersal_target: 1, days_dispersal_score: 1.5 },
    peerCohort: { cohortName: "Retail (NAICS 453)", subjectVolume: 290, subjectVelocity: 0.1, points: [{ accountId: "P2801", volume: 250, velocity: 0.1, isSubject: true }] }
  }
];

export const ACCOUNT_NODES: AccountNode[] = [
  // Flagged Suspicious Cluster (Centerpiece ring)
  { id: "A100342", label: "A100342", bank: 3, flagged: true, riskScore: 99.9, category: "Structuring Hub", x: 0, y: 1.5, z: 0, volume: 184500, txnCount: 28, clusterId: "ring_alpha" },
  { id: "A100891", label: "A100891", bank: 7, flagged: true, riskScore: 96.8, category: "Layering Mule", x: 3.5, y: 0.5, z: -2.0, volume: 142000, txnCount: 19, clusterId: "ring_alpha" },
  { id: "A100205", label: "A100205", bank: 5, flagged: true, riskScore: 92.4, category: "Originator Mule", x: -2.5, y: -1.0, z: 2.5, volume: 118000, txnCount: 22, clusterId: "ring_alpha" },

  // Secondary high-risk nodes
  { id: "A100114", label: "A100114", bank: 12, flagged: false, riskScore: 68.2, category: "Dormant Corp", x: -4.5, y: 3.0, z: -1.5, volume: 84000, txnCount: 8 },
  { id: "A100778", label: "A100778", bank: 2, flagged: false, riskScore: 78.4, category: "Branch Smurf", x: 1.5, y: -3.5, z: 3.0, volume: 92000, txnCount: 15 },
  { id: "A100552", label: "A100552", bank: 8, flagged: false, riskScore: 88.0, category: "Offshore Shell", x: 6.0, y: 2.0, z: 1.0, volume: 165000, txnCount: 12 },
  { id: "A100903", label: "A100903", bank: 15, flagged: false, riskScore: 49.3, category: "Holding Entity", x: 5.5, y: -2.0, z: -3.5, volume: 62000, txnCount: 7 },
  { id: "A100619", label: "A100619", bank: 4, flagged: false, riskScore: 85.1, category: "Feeder Account", x: -3.5, y: 1.0, z: 4.0, volume: 110000, txnCount: 14 },
  { id: "A100411", label: "A100411", bank: 1, flagged: false, riskScore: 81.5, category: "Funnel Collector", x: -6.0, y: -2.5, z: 0.5, volume: 95000, txnCount: 18 },
  { id: "A100832", label: "A100832", bank: 9, flagged: false, riskScore: 61.4, category: "Vendor Proxy", x: -4.0, y: -4.0, z: -2.5, volume: 48000, txnCount: 9 },

  // Nominal / Legitimate Accounts
  { id: "A100199", label: "A100199", bank: 11, flagged: false, riskScore: 53.5, category: "Commercial Supplier", x: 2.5, y: -4.5, z: -1.5, volume: 38000, txnCount: 11 },
  { id: "A100647", label: "A100647", bank: 6, flagged: false, riskScore: 74.6, category: "Contractor Account", x: -6.5, y: 1.5, z: -4.0, volume: 54000, txnCount: 10 },
  { id: "A100721", label: "A100721", bank: 10, flagged: false, riskScore: 45.1, category: "Corporate Operating", x: -1.0, y: 4.5, z: -3.5, volume: 32000, txnCount: 6 },
  { id: "A100308", label: "A100308", bank: 14, flagged: false, riskScore: 42.0, category: "Equipment Leasing", x: 2.0, y: 3.5, z: 4.0, volume: 41000, txnCount: 8 },
  { id: "A100512", label: "A100512", bank: 14, flagged: false, riskScore: 22.4, category: "Utility Provider", x: -1.5, y: -3.0, z: -4.5, volume: 29000, txnCount: 14 },
  { id: "A100441", label: "A100441", bank: 16, flagged: false, riskScore: 12.3, category: "Verified Payroll", x: 4.0, y: 4.0, z: -2.0, volume: 18000, txnCount: 20 },
  { id: "A100719", label: "A100719", bank: 3, flagged: false, riskScore: 14.5, category: "Retail Checking", x: 0.5, y: -5.5, z: 1.5, volume: 12000, txnCount: 16 },
  { id: "A100882", label: "A100882", bank: 5, flagged: false, riskScore: 8.2, category: "Merchant Processor", x: -5.0, y: 4.5, z: 2.0, volume: 22000, txnCount: 24 }
];

export const TRANSACTION_EDGES: TransactionEdge[] = [
  // Cyclic Flow Loop (A100205 -> A100342 -> A100891 -> A100205)
  { id: "e_cycle_1", from: "A100205", to: "A100342", amount: 34210, format: "Wire", timestamp: "2026-01-12T22:47:00", typology: "cyclic_flow" },
  { id: "e_cycle_2", from: "A100342", to: "A100891", amount: 43000, format: "Wire", timestamp: "2026-01-13T01:15:00", typology: "cyclic_flow" },
  { id: "e_cycle_3", from: "A100891", to: "A100205", amount: 39500, format: "Wire", timestamp: "2026-01-13T04:20:00", typology: "cyclic_flow" },

  // Structuring / Smurfing convergence into A100342
  { id: "e_struct_1", from: "A100619", to: "A100342", amount: 9500, format: "Cash", timestamp: "2026-01-14T06:10:00", typology: "structuring" },
  { id: "e_struct_2", from: "A100441", to: "A100342", amount: 9450, format: "ACH", timestamp: "2026-01-14T07:20:00", typology: "structuring" },
  { id: "e_struct_3", from: "A100778", to: "A100342", amount: 9900, format: "Cash", timestamp: "2026-01-14T08:35:00", typology: "structuring" },
  { id: "e_struct_4", from: "A100342", to: "A100891", amount: 28500, format: "Wire", timestamp: "2026-01-14T09:12:00", typology: "structuring" },

  // Mule Account Fan-Out from A100411
  { id: "e_mule_1", from: "A100903", to: "A100411", amount: 65000, format: "Wire", timestamp: "2026-01-14T08:00:00", typology: "mule_fanout" },
  { id: "e_mule_2", from: "A100411", to: "A100832", amount: 16000, format: "Wire", timestamp: "2026-01-14T09:30:00", typology: "mule_fanout" },
  { id: "e_mule_3", from: "A100411", to: "A100647", amount: 15500, format: "Wire", timestamp: "2026-01-14T09:45:00", typology: "mule_fanout" },
  { id: "e_mule_4", from: "A100411", to: "A100512", amount: 14800, format: "Wire", timestamp: "2026-01-14T10:04:00", typology: "mule_fanout" },

  // Cross-border & secondary links
  { id: "e_norm_1", from: "A100114", to: "A100891", amount: 48900, format: "Wire", timestamp: "2026-01-14T08:05:00" },
  { id: "e_norm_2", from: "A100552", to: "A100903", amount: 125000, format: "Wire", timestamp: "2026-01-14T07:15:00" },
  { id: "e_norm_3", from: "A100778", to: "A100199", amount: 18500, format: "ACH", timestamp: "2026-01-13T14:10:00" },
  { id: "e_norm_4", from: "A100647", to: "A100721", amount: 9200, format: "Cheque", timestamp: "2026-01-11T13:40:00" },
  { id: "e_norm_5", from: "A100308", to: "A100512", amount: 27500, format: "Wire", timestamp: "2026-01-13T10:18:00" },
  { id: "e_norm_6", from: "A100512", to: "A100114", amount: 32000, format: "Wire", timestamp: "2026-01-11T18:04:00" },
  { id: "e_norm_7", from: "A100552", to: "A100308", amount: 15600, format: "Wire", timestamp: "2026-01-13T15:55:00" },
  { id: "e_norm_8", from: "A100114", to: "A100441", amount: 3450, format: "ACH", timestamp: "2026-01-14T11:02:00" },
  { id: "e_norm_9", from: "A100619", to: "A100512", amount: 820, format: "ACH", timestamp: "2026-01-14T11:15:00" },
  { id: "e_norm_10", from: "A100719", to: "A100882", amount: 4200, format: "ACH", timestamp: "2026-01-14T12:00:00" }
];

export const TYPOLOGY_SEQUENCES: TypologySequence[] = [
  {
    id: "structuring",
    name: "Smurfing / Structuring Convergence",
    tagline: "Coordinated sub-$10k deposits funneling into central hub account",
    riskScore: 99.9,
    edgeIds: ["e_struct_1", "e_struct_2", "e_struct_3", "e_struct_4"],
    steps: [
      {
        stepIndex: 1,
        timeLabel: "T+00:00 (06:10 UTC)",
        title: "Micro-Deposit 1: Cash Branch Teller",
        description: "Account A100619 deposits $9,500 in cash at East Metro branch teller, just $500 below BSA reporting threshold.",
        activeEdgeId: "e_struct_1",
        activeNodeIds: ["A100619", "A100342"]
      },
      {
        stepIndex: 2,
        timeLabel: "T+01:10 (07:20 UTC)",
        title: "Micro-Deposit 2: Electronic Inflow",
        description: "Account A100441 transfers $9,450 via ACH from secondary bank, matching smurfing profile.",
        activeEdgeId: "e_struct_2",
        activeNodeIds: ["A100441", "A100342"]
      },
      {
        stepIndex: 3,
        timeLabel: "T+02:25 (08:35 UTC)",
        title: "Micro-Deposit 3: Regional Cash Deposit",
        description: "Account A100778 executes $9,900 cash deposit across town, calibrating $100 below statutory limit.",
        activeEdgeId: "e_struct_3",
        activeNodeIds: ["A100778", "A100342"]
      },
      {
        stepIndex: 4,
        timeLabel: "T+03:02 (09:12 UTC)",
        title: "Lump-Sum Dispersal Wire",
        description: "Hub account A100342 consolidates the deposits and dispatches a single $28,500 wire to mule A100891.",
        activeEdgeId: "e_struct_4",
        activeNodeIds: ["A100342", "A100891"]
      }
    ]
  },
  {
    id: "cyclic_flow",
    name: "Cyclic Flow Layering Loop",
    tagline: "Rapid round-trip transit obscuring origin through 3 intermediate entities",
    riskScore: 92.4,
    edgeIds: ["e_cycle_1", "e_cycle_2", "e_cycle_3"],
    steps: [
      {
        stepIndex: 1,
        timeLabel: "T+00:00 (22:47 UTC)",
        title: "Originator Layer 1 Outflow",
        description: "Originator A100205 initiates high-value wire of $34,210 to commercial proxy account A100342.",
        activeEdgeId: "e_cycle_1",
        activeNodeIds: ["A100205", "A100342"]
      },
      {
        stepIndex: 2,
        timeLabel: "T+02:28 (01:15 UTC)",
        title: "Hop 2: Broker Transit Transfer",
        description: "Hub account A100342 supplements funds and wires $43,000 to intermediary account A100891 within 2.5 hours.",
        activeEdgeId: "e_cycle_2",
        activeNodeIds: ["A100342", "A100891"]
      },
      {
        stepIndex: 3,
        timeLabel: "T+05:33 (04:20 UTC)",
        title: "Hop 3: Round-Trip Cycle Closure",
        description: "A100891 returns $39,500 back into originator A100205 under guise of an overseas trade invoice, completing the cycle.",
        activeEdgeId: "e_cycle_3",
        activeNodeIds: ["A100891", "A100205"]
      }
    ]
  },
  {
    id: "mule_fanout",
    name: "Funnel Collector to Mule Fan-Out",
    tagline: "High-value consolidation instantly dispersed across multiple runner accounts",
    riskScore: 81.5,
    edgeIds: ["e_mule_1", "e_mule_2", "e_mule_3", "e_mule_4"],
    steps: [
      {
        stepIndex: 1,
        timeLabel: "T+00:00 (08:00 UTC)",
        title: "Inbound Wire Consolidation",
        description: "Collector account A100411 receives $65,000 wire from unverified offshore shell company A100903.",
        activeEdgeId: "e_mule_1",
        activeNodeIds: ["A100903", "A100411"]
      },
      {
        stepIndex: 2,
        timeLabel: "T+01:30 (09:30 UTC)",
        title: "Dispersal Leg 1: Mule Runner A",
        description: "Immediate outward wire of $16,000 sent to A100832 for rapid ATM debit card withdrawal.",
        activeEdgeId: "e_mule_2",
        activeNodeIds: ["A100411", "A100832"]
      },
      {
        stepIndex: 3,
        timeLabel: "T+01:45 (09:45 UTC)",
        title: "Dispersal Leg 2: Mule Runner B",
        description: "Second wire of $15,500 sent to contractor account A100647 within 15 minutes.",
        activeEdgeId: "e_mule_3",
        activeNodeIds: ["A100411", "A100647"]
      },
      {
        stepIndex: 4,
        timeLabel: "T+02:04 (10:04 UTC)",
        title: "Dispersal Leg 3: Account Drain",
        description: "Final transfer of $14,800 clears remaining balance to A100512, reducing funnel account balance to nominal.",
        activeEdgeId: "e_mule_4",
        activeNodeIds: ["A100411", "A100512"]
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log_01",
    timestamp: "2026-01-14T11:45:12Z",
    txnId: "17450",
    action: "ESCALATE_SAR",
    operator: "Dakshraj Singh (Owner)",
    notes: "SAR filing approved under BSA FinCEN regulation. Serial structuring confirmed via branch teller logs."
  },
  {
    id: "log_02",
    timestamp: "2026-01-14T10:15:30Z",
    txnId: "17650",
    action: "CLEAR_ALERT",
    operator: "Dakshraj Singh (Owner)",
    notes: "Audited corporate dividend distribution resolution reviewed and cross-referenced with secretary of state filings."
  },
  {
    id: "log_03",
    timestamp: "2026-01-14T09:40:18Z",
    txnId: "17906",
    action: "ADD_NOTE",
    operator: "Dakshraj Singh (Owner)",
    notes: "Cross-border tracing underway with correspondent clearing banks 5 and 3. Layering cycle validated."
  }
];

export const LIVE_ALERT_POOL: AlertNotification[] = [
  { id: "alt_1", timestamp: "Just now", txnId: "19544", fromAccount: "A100342", toAccount: "A100891", amount: 9800, riskScore: 98.4, type: "Smurfing Velocity Alert" },
  { id: "alt_2", timestamp: "2m ago", txnId: "19551", fromAccount: "A100552", toAccount: "A100903", amount: 140000, riskScore: 89.2, type: "Cross-Border Wire Outlier" },
  { id: "alt_3", timestamp: "5m ago", txnId: "19560", fromAccount: "A100205", toAccount: "A100778", amount: 9950, riskScore: 95.1, type: "Cash Structuring Flag" },
  { id: "alt_4", timestamp: "8m ago", txnId: "19567", fromAccount: "A100411", toAccount: "A100832", amount: 54000, riskScore: 83.7, type: "Funnel Dispersal Surge" },
  { id: "alt_5", timestamp: "11m ago", txnId: "19572", fromAccount: "A100114", toAccount: "A100891", amount: 37500, riskScore: 76.5, type: "Dormancy Reactivation" }
];
